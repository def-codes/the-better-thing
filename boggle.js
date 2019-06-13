const { transducers: tx, rstream: rs, hdom } = thi.ng;
const { updateDOM } = thi.ng.transducersHdom;

const SPACE_COMMON = `space.isa.Forcefield,
space.hasForce.center,
space.hasForce.charge,
center.isa.forceCenter,
charge.isa.forceManyBody,
charge.strength(-200),
charge.distanceMax(250),
charge.theta(0.98),
`;

const TYPE = rdf.namedNode("isa");

const is_node = term =>
  term.termType === "NamedNode" || term.termType === "BlankNode";

const mint_blank = () => rdf.blankNode();

const node_or_blank = x => (is_node(x) ? x : mint_blank());

// We're not actually changing to RDF triples as such...
// just using RDF terms with rstream-query-style tuples
const trip = (s, p, o) => [
  typeof s === "string" ? rdf.namedNode(s) : s,
  typeof p === "string" ? rdf.namedNode(p) : p,
  !o || !o.termType ? rdf.literal(o) : o
];

const make_store = () => new thi.ng.rstreamQuery.TripleStore();

// ================================= crazy proxies

const make_crazy_proxy = system => {
  // Short-circuits for all crazy proxies.
  const ALWAYS = {
    [Symbol.unscopables]: undefined, // checked when using `with` block
    [Symbol.iterator]: undefined,
    [Symbol.toPrimitive]: undefined,
    inspect: undefined // for node only
  };

  const make_proxy = (context = []) => {
    const target = () => {};
    const local = {
      context,
      toJSON: () => JSON.stringify(context),
      toString: () => context.toString()
    };
    const scopes = [ALWAYS, local, system, globalThis];
    return new Proxy(target, {
      has: (target, key) => true,
      apply: (target, thisArg, args) => make_proxy([...context, { args }]),
      get: (_target, key, _receiver) => {
        for (const scope of scopes) if (key in scope) return scope[key];
        return make_proxy([...context, { key }]);
      }
    });
  };

  return make_proxy();
};

// ========================= Pattern matcher

const pattern_proxy = target =>
  new Proxy(target, {
    get(target, key) {
      // could trap Symbol.iterator here for finer array handling
      if (typeof key === "symbol" || key in target) {
        const value = target[key];
        return value !== null && typeof value === "object"
          ? pattern_proxy(value)
          : value;
      }
      throw Error("No such key");
    }
  });

const match = (patterns, input) => {
  const proxy = pattern_proxy(input);
  for (const pattern of patterns)
    try {
      if (pattern(proxy)) return pattern(input);
    } catch (e) {}
};

// ========================================  traversal (new)

const all_values_for = (store, subject, property) =>
  tx.pluck(
    "object",
    // !!!GLOBAL!!! !!!DEFINED IN SYSTEM!
    sync_query(store, [[subject, property, rdf.variable("object")]]) || []
  );

const all_properties_for = (store, subject) =>
  sync_query(store, [
    [subject, rdf.variable("property"), rdf.variable("object")]
  ]) || [];

// iterate all resources reachable by `follow` property from `start`
function traverse(store, start, follow) {
  const queue = [start];
  const out = new Set();
  while (queue.length > 0) {
    const subject = queue.pop();
    out.add(subject);
    if (follow) {
      for (const object of all_values_for(store, subject, follow))
        if (is_node(object) && !out.has(object)) queue.push(object);
    } else
      for (const { object } of all_properties_for(store, subject))
        if (is_node(object) && !out.has(object)) queue.push(object);
  }
  return out;
}

// ================================= WORLD / INTERPRETER

const make_world = () => {
  const store = new thi.ng.rstreamQuery.TripleStore();

  const { namedNode: n, literal: l } = rdf;

  // default context.  treat expressions kind of like turtle
  // we can't tell whether brackets or dot was used for get
  // so we treat all keys as tokens (terms)
  // Actually would need to recur here (as_turtle) on s & p, etc
  const TURTLE_PATTERNS = [
    ([{ key: s }, { key: p }, { key: o }]) => [n(s), n(p), n(o)],
    // prettier-ignore
    ([{ key: s }, { key: p }, { args: [o]}]) => [n(s), n(p), l(o)]
  ];

  const as_turtle = expression =>
    expression && match(TURTLE_PATTERNS, expression.context);

  // TODO: these older adapters are retained only for rules
  // should be able to use `as_turtle` now, right?
  const as_term = step =>
    step.key[0] === "$" ? `?${step.key.slice(1)}` : rdf.namedNode(step.key);
  const as_triple = _ => _.context.map(as_term);
  const query = (...clauses) => read =>
    store
      .addQueryFromSpec({ q: [{ where: clauses.map(as_triple) }] })
      .subscribe(tx.comp(tx.flatten(), tx.map(read)));

  const as_named = expr => expr && match([([{ key }]) => n(key)], expr.context);

  // start is an entry point
  // - could later support multiple
  // follow is a property to use for traversal
  // - could later support multiple
  //
  // do an exhaustive traversal from the starting point(s)
  const system = {
    forall(subjects, conclusion) {
      const { o, p } =
        match(
          [([{ key: p }, { key: o }]) => ({ p: n(p), o: n(o) })],
          conclusion.context
        ) || {};

      if (o && p)
        store.into(tx.map(s => [is_node(s) ? s : as_named(s), p, o], subjects));
    },

    subgraph(start_expr, follow_expr) {
      const start = as_named(start_expr);
      const follow = as_named(follow_expr);

      if (start) return traverse(store, start, follow);
    },

    mesh(rows, cols, prop) {
      const size = { rows, cols };

      const term = rdf.namedNode(
        (prop && match([([{ key }]) => key], prop)) || "linksTo"
      );

      const ids = [...tx.map(mint_blank, tx.range(rows * cols))];

      const links = tx.iterator(
        tx.mapcat(n =>
          tx.map(
            other => [ids[n], term, ids[other]],
            neighbors_of_index(size, n)
          )
        ),

        tx.range(rows * cols)
      );

      // this should be a separate step
      store.into(links);
    },

    rule: ({ when, then }) =>
      query(...when)(match =>
        then.forEach(clause =>
          store.add(
            as_triple(clause).map(
              // Map variables in the consequent clause to the matched values.
              term => (term[0] === "?" ? match[term.slice(1)] : term)
            )
          )
        )
      ),

    // Helper to add triple-like expressions to the store.
    claim: (...things) => store.into(tx.keep(things.map(as_turtle))),

    list: (...things) =>
      store.into(
        sequence_as_triples(
          things.map(thing => {
            if (!Array.isArray(thing.context)) throw "list: Not a proxy";
            if (thing.context.length !== 1) throw "list: term is not unary";
            return rdf.namedNode(thing.context[0].key);
          })
        )
      ),

    range: (...args) => store.into(sequence_as_triples(tx.range(...args))),

    // For querying the state of the knowledge base.
    is_it_a_fact_that: _ => store.has(as_triple(_)),
    say: console.log,
    store,
    query
  };

  return make_crazy_proxy(system);
};

// ============================================================ READER

const read_userland_code = (code, world) =>
  new Function(
    "world",
    `with (world) { 
${code}
  }`
  )(world);

function get_store_from(userland_code) {
  const world = make_world();
  try {
    read_userland_code(userland_code, world);
  } catch (error) {
    console.error("reading userland code", error);
    return undefined;
  }
  return world.store;
}

// =============================================================== (WORD) TRIE

function make_trie() {
  const trie = {};

  return {
    data: trie, // for debug
    add(word) {
      let target = trie;
      for (const letter of word) {
        if (!(letter in target)) target[letter] = { count: 0 };
        target = target[letter];
      }
      target.count++;
    },
    get(word) {
      let target = trie;
      for (const letter of word)
        if (letter in target) target = target[letter];
        else return false;
      return target.count;
    },
    scan: function*(sequence) {
      let target = trie;
      for (const token of sequence) {
        if (target && token in target) target = target[token];
        else target = undefined;
        yield [token, target];
      }
    }
  };
}

// ============================================= BOGGLE STUFF

const FACES = Array.from(
  "aaaaaaaabbbccccdddddeeeeeeeeeeeeffffgggghhhhiiiiiiiijjkklllllllllmmmmmnnnnnnooooooooooppppprrrrrrrsssssssssstttttttuuuuuuuvvwwwxyyyyz"
).concat(["qu", "th", "in", "he"]);

const BOARD_SIZE = { rows: 10, cols: 10 };
const MIN_WORD_LENGTH = 7;
const MAX_WORD_LENGTH = 100;

function* combinations(as, bs) {
  for (let a of as) for (let b of bs) yield [a, b];
}

const NEIGHBOR_DELTAS = [...combinations([-1, 0, 1], [-1, 0, 1])].filter(
  ([a, b]) => !(a === 0 && b === 0)
);

const between = (x, min, max) => x >= min && x <= max;

const row_of = (size, index) => Math.floor(index / size.cols);
const col_of = (size, index) => index % size.cols;
const index_of = (size, row, col) => row * size.cols + col;

const neighbors_of = (size, row, col) =>
  NEIGHBOR_DELTAS.map(([dr, dc]) => [row + dr, col + dc]).filter(
    ([row, col]) =>
      between(row, 0, size.rows - 1) && between(col, 0, size.cols - 1)
  );
const neighbors_of_index = (size, index) =>
  neighbors_of(size, row_of(size, index), col_of(size, index)).map(
    ([row, col]) => index_of(size, row, col)
  );

function* iterate_paths(graph, queue, should_stop, get_moves) {
  while (queue.length > 0) {
    const path = queue.pop();
    yield path;
    if (!should_stop(path))
      queue.push(...tx.map(next => [...path, next], get_moves(path)));
  }
}

function* iterate_solutions(graph, is_solution, should_stop) {
  const gen = iterate_paths(
    graph,
    Object.keys(graph.nodes).map(n => [n]),
    should_stop,
    path => graph.edges[path[path.length - 1]].filter(id => !path.includes(id))
  );

  for (const path of gen) if (is_solution(path)) yield path;
}

/* board generator */

const random_integer_less_than = n => Math.floor(Math.random() * n);
const random_item_from = array => array[random_integer_less_than(array.length)];

const random_face = () => random_item_from(FACES);
const random_board = size => ({
  nodes: tx.transduce(
    tx.mapIndexed((idx, val) => [idx, val]),
    tx.assocObj(),
    tx.repeatedly(random_face, size.rows * size.cols)
  ),
  edges: tx.transduce(
    tx.map(n => [n, neighbors_of_index(size, n)]),
    tx.assocObj(),
    tx.range(size.rows * size.cols)
  )
});

function solve(trie, graph) {
  const uniques = new Set();
  const solutions = [];

  const and = (a, b) => !!(a && b);
  const or = (a, b) => !!(a || b);
  const and_all = (...args) => args.reduce(and);

  const lookup = i => graph.nodes[i];
  const make_word = path => path.map(lookup).join("");
  const is_word = path => trie.get(make_word(path)) > 0;
  // But this is *path* length, not *word* length
  const not_too_long = path => path.length <= MAX_WORD_LENGTH;
  const not_too_short = path => path.length >= MIN_WORD_LENGTH;
  const solution_clauses = [is_word, not_too_long, not_too_short];
  const is_solution = path => and_all(...solution_clauses.map(fn => fn(path)));
  // const is_solution = path => clauses.every(fn => fn(path));

  const is_not_prefix = path => trie.get(make_word(path)) === false;
  const is_max_length = path => path.length >= MAX_WORD_LENGTH;
  // Doesn't short circuit... computes both always
  const should_stop = path => or(is_max_length(path), is_not_prefix(path));

  const all_solutions = [...iterate_solutions(graph, is_solution, should_stop)];

  for (let path of all_solutions) {
    const word = make_word(path);
    if (!uniques.has(word)) {
      uniques.add(word);
      solutions.push([path, word]);
    }
  }

  return solutions;
}

// ======================================================  GRAPH VIEW SUPPORT

const angle_of = (x, y) =>
  x === 0 ? (y < 0 ? 0 : Math.PI) : Math.atan(y / x) + (x < 0 ? Math.PI : 0);

const angle_between = (x1, y1, x2, y2) => angle_of(x2 - x1, y2 - y1);
const hypotenuse = (a, b) => Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));

const render_properties = (_, properties) => [
  "div",
  tx.map(
    ([s, p, o]) => [
      "div.Property",
      {
        "data-subject": s.value,
        "data-property": p.value,
        "data-object": o.value
      },
      p
    ],
    properties
  )
];

// given a store, create a subscription that yields all of the resources it
// talks about, i.e. every named or blank node in a subject or object position.
const resources_in = store =>
  store
    .addQueryFromSpec({
      q: [{ where: [["?subject", "?predicate", "?object"]] }]
    })
    .transform(
      tx.map(triples =>
        tx.transduce(
          tx.comp(
            tx.multiplex(tx.pluck("subject"), tx.pluck("object")),
            tx.cat(),
            tx.filter(is_node),
            // This can't be doing anything after the above filter
            tx.keep()
          ),
          tx.conj(),
          triples
        )
      )
    );

// given a store and a list of resources, render those resources and their
// (non-node) properties.
const render_resource_nodes = (_, { store, resources }) => {
  const literal_props = tx.transduce(
    // Limit to literal (value) props, as nodes and links are displayed
    // independently.  Allows links to be on separate layer.
    tx.filter(([, , o]) => o.termType === "Literal"),
    tx.groupByMap({ key: ([s]) => s }),
    store.triples
  );

  return [
    "div",
    {},
    tx.map(
      resource => [
        "div",
        {
          "data-thing": resource.value,
          class: [
            "Resource",
            ...tx.map(
              type => type.value,
              all_values_for(store, resource, TYPE) || []
            )
          ].join("  ")
        },
        [
          "div.resource-content",
          {},
          !literal_props.has(resource)
            ? resource.value
            : tx.map(
                ([, p, o]) => [
                  "div",
                  { "data-property": p.value },
                  o.value && o.value.toString()
                ],
                literal_props.get(resource)
              )
        ]
      ],
      resources
    )
  ];
};

const value_prop = rdf.namedNode("value");

const thing_position_css = space_id => ({ id, x, y }) =>
  `#${space_id} [data-thing="${id}"]{top:${y}px;left:${x}px}`;

const things_position_css = (space_id, things) =>
  [...tx.map(thing_position_css(space_id), things)].join("\n");

function position_things(style_ele, space_id, things) {
  style_ele.innerHTML = things_position_css(space_id, things);
}

const property_placement_css = ({ triple, source, target, layer_id }) => {
  const [s, p, o] = triple;
  const selector = `#${layer_id} [data-subject="${s.value}"][data-object="${
    o.value
  }"]`;
  const { x: x1, y: y1 } = source;
  const { x: x2, y: y2 } = target;
  const top = y1.toFixed(2);
  const left = x1.toFixed(2);
  const width = (hypotenuse(x2 - x1, y2 - y1) || 1).toFixed(2);
  const angle = angle_between(x1, y1, x2, y2).toFixed(2);

  // The second translate is useful if you have a property in each
  // direction between two nodes.  More than that would be hard.
  return `${selector}{width:${width}px;transform: translate(${left}px,${top}px) rotate(${angle}rad) translateY(-50%);}`;
};

// ==================================================  MACRO HELPERS

function* sequence_as_triples_cycle(seq) {
  const nodes = [...seq];
  const ids = nodes.map(node_or_blank);

  yield* tx.mapIndexed((index, node) => trip(ids[index], "value", node), nodes);
  yield* tx.map(
    n => trip(ids[n], "linksTo", ids[n < nodes.length - 1 ? n + 1 : 0]),
    tx.range(nodes.length)
  );
}

function* sequence_as_triples(seq) {
  const nodes = [...seq];
  const ids = nodes.map(node_or_blank);
  yield* tx.mapIndexed((index, node) => trip(ids[index], "value", node), nodes);
  yield* tx.map(
    n => trip(ids[n], "linksTo", ids[n + 1]),
    tx.range(nodes.length - 1)
  );
}

const render_trie_node = (_, { value: [token, t] }) => [
  "span.trie-node",
  {
    "data-count": t ? t.count : 0,
    "data-is-match": t ? "yes" : "no",
    "data-is-terminal": t && t.count > 0 ? "yes" : "no"
  },
  ["span.token", token],
  " ",
  ["span.count", t ? t.count : ""]
];

const all_examples = [
  {
    name: "forall",
    label: "forall macro",
    comment: `assert properties about subjects`,
    userland_code: `forall([Alice, Bob], isa.Person)
claim(
foo.isa.forceLink,
foo.id(_ => _.id),
foo.connects.linksTo,
space.hasForce.foo,
${SPACE_COMMON}
)
`
  },

  {
    name: "subgraph",
    label: "subgraph selection",
    comment: `do an exhaustive search`,
    userland_code: `claim(
Alice . knows . Bob,
Bob . knows . Carol,
Carol . knows . Jake,
Jake . knows .  Carol,
Jake . knows .  Miriam,
Miriam . knows .  Alice,
Miriam . knows .  Bob
)
forall(subgraph(Alice, knows), isa.Selected)
claim(
foo.isa.forceLink,
foo.id(_ => _.id),
foo.connects.linksTo,
space.hasForce.foo,
${SPACE_COMMON}
)
`
  },
  {
    name: "mesh-macro",
    label: "make a mesh",
    comment: `create a mesh of blank nodes`,
    userland_code: `mesh(3, 3)
//range(10)
claim(
foo.isa.forceLink,
foo.id(_ => _.id),
foo.connects.linksTo,
space.hasForce.foo,
${SPACE_COMMON}
)
`
  },
  {
    name: "code-in-world",
    label: "simple claims",
    comment: `testing expression reader`,
    userland_code: `claim(
Alice.loves.Bob,
Bob.likes.Alice,
${SPACE_COMMON}
)
`
  },
  {
    name: "boggle",
    label: "boggle with solutions",
    comment: `the full boggle example, with path search`,
    userland_code: `// board = boggle_grid(10, 10)
// set of search?
// etc
`
    /*
    async get_store() {
      const boggle_graph = random_board(BOARD_SIZE);
      const trie = await get_trie();
      const solutions = await solve(trie, boggle_graph);

      const ids = tx.transduce(
        tx.map(key => [key, mint_blank()]),
        tx.assocObj(),
        Object.keys(boggle_graph.nodes)
      );

      const solution_paths = solutions.map(_ => _[0]);
      const store = make_store();
      store.into(
        tx.map(
          ([s, o]) => trip(ids[s], "value", o),
          Object.entries(boggle_graph.nodes)
        )
      );

      store.into(
        tx.mapcat(
          ([s, targets]) =>
            tx.map(o => trip(ids[s], "linksTo", ids[o]), targets),
          Object.entries(boggle_graph.edges)
        )
      );
      return store;
    }
*/
  },
  {
    name: "trie-view-level-1",
    label: "trie level one",
    comment: `show the first node of a trie`,
    // DISABLED: not going to convert this to triples as such, too messy
    async get_resources() {
      const trie = await get_trie();
      return {
        graph: {
          nodes: {
            root: "root",
            ...tx.transduce(
              tx.map(k => [k, k]),
              tx.assocObj(),
              Object.keys(trie.data)
            )
          },
          edges: { root: Object.keys(trie.data) }
        },
        paths: []
      };
    }
  },
  {
    name: "trie-view-level-2",
    label: "trie level two",
    comment: `show the first two levels of a trie`,
    // DISABLED: not going to convert this to triples as such, too messy
    async get_resources() {
      const trie = await get_trie();
      return {
        graph: {
          nodes: {
            root: "root",
            ...tx.transduce(
              tx.map(k => [k, k]),
              tx.assocObj(),
              Object.keys(trie.data).filter(k => k.length === 1)
            ),
            ...tx.transduce(
              tx.map(k => [k, k]),
              tx.assocObj(),
              tx.mapcat(
                k =>
                  Object.keys(trie.data[k])
                    .filter(k => k.length === 1)
                    .map(k2 => k + k2),
                Object.keys(trie.data).filter(k => k.length === 1)
              )
            )
          },
          edges: {
            root: Object.keys(trie.data),
            ...tx.transduce(
              tx.map(k => [
                k,
                Object.keys(trie.data[k])
                  .filter(k => k.length === 1)
                  .map(k2 => k + k2)
              ]),
              tx.assocObj(),
              Object.keys(trie.data).filter(k => k.length === 1)
            )
          }
        },
        paths: []
      };
    }
  },
  {
    name: "trie-prefix-1",
    label: "trie match 1",
    comment: `matching a term against trie`,
    userland_code: `// trie = willshake_words
// trie match/scan "qpoinspr"
// trie match/scan "hello"
// trie match/scan "world"
// trie node looks like render_trie_node
`
  },
  {
    name: "graph2",
    label: "testing another graph",
    comment: `an example graph`,
    userland_code: `
claim(
a . value . Alice,
b . value . Bob,
c . value . Carol,
d . value . Dave,
a . linksTo . b,
a . linksTo . c,
b . linksTo . d,
${SPACE_COMMON}
)
`
  },
  {
    name: "graph3",
    label: "sequence as graph",
    comment: `turn a sequence into a graph`,
    userland_code: `list(Alice, Bob, Carol, Dave, Elon, Fran)
claim(
${SPACE_COMMON}
)

`
  },
  {
    name: "symmetrical",
    label: "symmetrical property",
    comment: `a symmetrical property always applies in both directions`,
    userland_code: `claim(knows.isa.SymmetricalProperty)
rule({
  when: [$p.isa.SymmetricalProperty, $x.$p.$y],
  then: [$y.$p.$x]
})
claim(Alice.knows.Bob)
claim(
${SPACE_COMMON}
)

`
  },
  {
    name: "range-1",
    label: "integer range",
    comment: `a range from zero up to the number`,
    userland_code: `range(10)
claim(
${SPACE_COMMON}
)

`
  },
  {
    name: "cycle-1",
    label: "list cycle",
    comment: `make a list of the items with a linked head and tail`,
    userland_code: `range(10)
claim(
${SPACE_COMMON}
)

`
  },
  {
    name: "graph4",
    label: "sequence as graph cycle",
    comment: `turn a sequence into a loop in a graph`,
    userland_code: `a = range(10)
b = cycle(a)
`
  },
  {
    name: "graph5",
    label: "two separate structures on a graph",
    comment: `union of two independent generated sequences`,
    userland_code: `cycle(range(10))
range(20, 25)
`
  }
];

const dom_svg_space = (_, { id }) => [
  "div.space",
  { id },
  ["div.html"],
  // is preserveAspectRatio needed?
  //
  // you can use "everything" to apply transforms that wouldn't work (the same
  // way) on svg element itself.  But see .css file.
  ["svg", { preserveAspectRatio: "none" }, ["g.everything"]]
];

const render_example = example => [
  "article.example",
  { id: example.name },
  [
    "div.description",
    [
      "header",
      ["h3", {}, ["a", { href: `#${example.name}` }, example.label]],
      ["p.comment", example.comment]
    ],
    [
      "div.model-control",
      ["textarea.userland-code", { spellcheck: false }, example.userland_code]
    ]
  ],
  ["figure.representation", {}, [dom_svg_space, { id: example.name }]]
];

const render_examples = examples => [
  "div",
  {},
  tx.map(render_example, examples)
];

const get_word_list = async () => {
  const raw = await fetch("./words.json");
  return raw.json();
};

// memoized async
const get_trie = (function() {
  let trie;
  return async () => {
    if (!trie) {
      trie = make_trie();
      const word_list = await get_word_list();
      for (let word of word_list) trie.add(word);
    }
    return trie;
  };
})();

function create_forcefield_dataflow({
  // for scoping of created style rules
  // instead, provide a place to contribute style rules directly?
  // even as objects?
  layer_id,
  // id if the forcefield resource with the associated siulation
  forcefield_id,
  // needed (indirectly) for getting at the created simulation
  // there's got to be a way to avoid this
  model_system,
  // which resources to include in the forcefield
  resources,
  // which properties for which to update positioning rules
  properties,
  // style elements that are targets the the bespoke rule updates
  nodes_style,
  properties_style
}) {
  // simulation driving a/the FORCEFIELD
  const force_simulation = model_system.transform(
    tx.map(system => system.find(rdf.namedNode(forcefield_id))),
    tx.keep()
  );

  // set the (d3) nodes ARRAY for a/the FORCEFIELD from the identified resources
  // AND broadcast it
  const model_forcefield_nodes = rs
    .sync({ src: { resources, sim: force_simulation } })
    .transform(
      tx.map(({ resources, sim }) => ({
        sim,
        nodes: [...tx.map(({ value }) => ({ id: value }), resources)]
      })),
      tx.sideEffect(({ sim, nodes }) => sim.nodes(nodes)),
      tx.pluck("nodes")
    );

  // const tick_driver = rs.fromRAF();
  const tick_driver = rs.fromInterval(100);
  const ticks = rs.subscription();
  tick_driver.subscribe(ticks);

  // advance FORCEFIELD simulation PROCESS
  rs.sync({ src: { ticks, sim: force_simulation } }).transform(
    tx.sideEffect(({ sim }) => sim.tick())
  );

  // update FORCEFIELD node positions on every tick
  rs.sync({ src: { ticks, nodes: model_forcefield_nodes } }).subscribe({
    next: ({ nodes }) => position_things(nodes_style, layer_id, nodes)
  });

  // index SIMULATION nodes by resource identifier, for property positioning
  const nodes_by_id = model_forcefield_nodes.transform(
    tx.map(nodes =>
      tx.transduce(tx.map(node => [node.id, node]), tx.assocObj(), nodes)
    )
  );

  // passively place link representations from a FORCEFIELD/SIMULATION
  rs.sync({ src: { ticks, nodes_by_id, properties } }).transform(
    tx.map(({ nodes_by_id, properties }) =>
      [
        ...tx.iterator(
          tx.comp(
            tx.map(triple => ({
              layer_id,
              triple,
              source: nodes_by_id[triple[0].value],
              target: nodes_by_id[triple[2].value]
            })),
            tx.filter(_ => _.source && _.target),
            tx.map(property_placement_css)
          ),
          properties
        )
      ].join("\n")
    ),
    tx.sideEffect(css => (properties_style.innerHTML = css))
  );
}

function create_space_dataflow({
  // A dedicated DOM node for this space
  container,
  model_id,
  model_store,
  model_system,
  layer_id,
  // which resources to represent in the space
  resources,
  // which properties to represent in the  space
  properties
}) {
  // LAYER for representation of a set of resources
  const resources_container = container.appendChild(
    document.createElement("div")
  );

  // maintain representations of a set of resources in a given LAYER
  rs.sync({
    src: { store: model_store, resources },
    id: `${model_id}-store-and-resources`
  }).transform(
    tx.map(({ store, resources }) => [
      render_resource_nodes,
      { store, resources }
    ]),
    updateDOM({ root: resources_container })
  );

  // LAYER for representation of a set of properties obtaining between resources
  const properties_container = container.appendChild(
    document.createElement("div")
  );

  // passive positioning of resource representations in a SPACE/LAYER
  const nodes_style = container.appendChild(document.createElement("style"));

  // passive placement of property representations in a SPACE/LAYER
  // depends on positions of resource representations
  const properties_style = container.appendChild(
    document.createElement("style")
  );

  // maintain representations of the properties between a set of resources in a given LAYER
  properties.transform(
    tx.map(properties_to_show => [render_properties, properties_to_show]),
    updateDOM({ root: properties_container })
  );

  // ========== FORCEFIELD/SIMULATION stuff

  create_forcefield_dataflow({
    layer_id,
    forcefield_id: "space",
    model_system,
    resources, //model_resources,
    properties, //model_properties,
    nodes_style,
    properties_style
  });
}

function make_model_dataflow(model_spec) {
  const layer_id = model_spec.name;
  const model_id = model_spec.name;
  const root = document.getElementById(model_spec.name);
  const code_box = root.querySelector("textarea");

  // ============================== STORE & SYSTEM/RUNTIME

  // The runtime system backing the model's live resources/processes
  const model_system = rs.subscription();

  // the triple store for this model,  re-created whenever the code changes
  const model_store = rs.subscription().transform(
    tx.sideEffect(store => {
      if (!meld) {
        console.warn("no meld!");
        return;
      }
      if (typeof meld.apply_system !== "function") {
        console.warn("expected meld.apply_system to be a function!");
        return;
      }

      // I'm very dubious about this...
      model_system.next(meld.apply_system(store));
    })
  );

  // ================================  RESOURCES & PROPERTIES

  // a set of the resources in the store, (in subject or object position)
  const model_resources = rs.metaStream(
    store => resources_in(store),
    `${model_id}/store`
  );

  // the resource metastream is based on the store
  model_store.subscribe(model_resources);

  // select all properties (triples) from the model that point to resources
  const model_properties = model_store.transform(
    tx.map(store => [...tx.filter(([, , o]) => is_node(o), store.triples)])
  );

  // ================================== USERLAND CODE

  // The userland code
  const model_code = rs.subscription();

  // update USERLAND CODE when the user edits in the textbox
  rs.fromEvent(code_box, "input").transform(
    tx.throttleTime(1000),
    tx.map(event => event.target.value),
    tx.sideEffect(code => {
      model_code.next(code);
    })
  );

  // update the STORE by interpreting the USERLAND CODE
  model_code.subscribe({
    next(code) {
      // yes, we're rebuilding the world every time
      const store = get_store_from(code);
      // skip if there was a problem reading
      if (store) model_store.next(store);
    }
  });

  // ==================== SPACE/PLANE stuff

  const html = root.querySelector(".space .html");

  const space_resources = model_store.transform(
    tx.map(store =>
      traverse(store, rdf.namedNode("Alice"), rdf.namedNode("knows"))
    )
  );

  const space_properties = rs
    .sync({ src: { store: model_store, resources: space_resources } })
    .transform(
      tx.map(({ store, resources }) => [
        ...tx.filter(
          ([s, , o]) => is_node(o) && resources.has(o) && resources.has(s),
          console.log("tripes", store.triples) || store.triples
        )
      ])
    );

  create_space_dataflow({
    container: html,
    model_id,
    model_store,
    model_system,
    layer_id,
    resources: space_resources,
    properties: space_properties
  });

  if (model_spec.userland_code) model_code.next(model_spec.userland_code);
}

(async function() {
  const examples = all_examples
    .filter(_ => _.userland_code)
    .filter(_ => ["symmetrical", "graph2"].includes(_.name));

  hdom.renderOnce(render_examples(examples), { root: "examples" });

  for (const example of examples) make_model_dataflow(example);
})();
