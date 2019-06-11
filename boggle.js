const { transducers: tx, rstream: rs, hdom } = thi.ng;
const { updateDOM } = thi.ng.transducersHdom;

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

const make_store = () => {
  const store = new thi.ng.rstreamQuery.TripleStore();
  return { store };
};

const make_world = () => {
  const store = new thi.ng.rstreamQuery.TripleStore();

  const is_triple = _ =>
    _ && _.context.length === 3 && _.context.every(_ => _.key);

  // Adaptor for proxy expressions
  const as_term = step =>
    step.key[0] === "$" ? `?${step.key.slice(1)}` : rdf.namedNode(step.key);

  const as_triple = _ => _.context.map(as_term);

  const query = (...clauses) => read =>
    store
      .addQueryFromSpec({ q: [{ where: clauses.map(as_triple) }] })
      .subscribe(tx.comp(tx.flatten(), tx.map(read)));

  const system = {
    make_it_a_rule_that: ({ when, then }) =>
      query(...when)(match =>
        then.forEach(clause =>
          store.add(
            as_triple(clause).map(
              // Map variables in the consequent clause to the matched values.
              term =>
                rdf.namedNode(term[0] === "?" ? match[term.slice(1)] : term)
            )
          )
        )
      ),

    // Helper to add triple-like expressions to the store.
    claim: (...things) => store.into(things.filter(is_triple).map(as_triple)),

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
      get: (_target, key, _receiver) => {
        for (const scope of scopes) if (key in scope) return scope[key];
        return make_proxy([...context, { key }]);
      }
    });
  };
  return make_proxy();
};

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
    throw error;
  }
  return { store: world.store };
}

const FACES = Array.from(
  "aaaaaaaabbbccccdddddeeeeeeeeeeeeffffgggghhhhiiiiiiiijjkklllllllllmmmmmnnnnnnooooooooooppppprrrrrrrsssssssssstttttttuuuuuuuvvwwwxyyyyz"
).concat(["qu", "th", "in", "he"]);

const BOARD_SIZE = { rows: 10, cols: 10 };
const MIN_WORD_LENGTH = 7;
const MAX_WORD_LENGTH = 100;

function* combinations(as, bs) {
  for (let a of as) for (let b of bs) yield [a, b];
}

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

const angle_of = (x, y) =>
  x === 0 ? (y < 0 ? 0 : Math.PI) : Math.atan(y / x) + (x < 0 ? Math.PI : 0);

const angle_between = (x1, y1, x2, y2) => angle_of(x2 - x1, y2 - y1);
const hypotenuse = (a, b) => Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));

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

//=================

const SVGNS = "http://www.w3.org/2000/svg";

function path_search_stuff(graph, svg_container, path_data) {
  let search_path = [];

  function update_positions(n) {
    search_path_ele.setAttribute("d", path_data(search_path));
  }

  // const hic2 = ["path.search", {}];
  const search_path_ele = svg_container.appendChild(
    document.createElementNS(SVGNS, "path")
  );
  search_path_ele.classList.add("search", "graph-path");

  const queue_length_ele = document.getElementById("queue-length");

  const search_queue = Object.keys(graph.nodes).map(v => [v]);
  const paths_sub = rs.fromIterable(
    iterate_paths(
      graph,
      search_queue,
      path => path.length > 3,
      // () => false,
      path =>
        graph.edges[path[path.length - 1]].filter(id => !path.includes(id))
    ),
    1
  );

  paths_sub.transform(
    tx.sideEffect(path => {
      search_path = path;
      update_positions();
    }),
    tx.map(() => ["b", {}, search_queue.length.toString()]),
    updateDOM({ root: "queue-length" })
  );
}

const render_properties = (_, properties) => [
  "div",
  tx.map(
    ([s, p, o]) => [
      "div.property",
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

// select the resources that are going to be visible
// render a container for them, courtesy of host
// support notion that there can be "hasX" rules
// *adding* content into that node, in no particular order
// those are hdom functions which get access to
// what? the triple(s) that matched a rule.  Not the entire object
// do the same for properties.  so yeah this has nothing to do with the force model.

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
        "div.node",
        { "data-node": resource.value },
        [
          "div.node-content",
          {},
          !literal_props.has(resource)
            ? resource.value
            : tx.map(
                ([, p, o]) => ["div", { "data-property": p.value }, o.value],
                literal_props.get(resource)
              )
        ]
      ],
      resources
    )
  ];
};

const value_prop = rdf.namedNode("value");

// this should just produce a subscription
function force(
  space_id,
  resources,
  container,
  svg_container,
  node_view,
  store,
  paths
) {
  const sim = d3.forceSimulation().stop();

  const nodes = Array.from(resources, resource => ({ id: resource.value }));

  const properties_to_show = tx.transduce(
    tx.comp(tx.filter(([, p]) => p !== value_prop)),
    tx.push(),
    store.triples
  );

  const nodes_style = container.appendChild(document.createElement("style"));

  const properties_style = container.appendChild(
    document.createElement("style")
  );

  // These are now done when rendering node...
  hdom.renderOnce([render_properties, properties_to_show], { root: container });

  // I don't like this....
  const by_id = tx.transduce(
    tx.map(node => [node.id, node]),
    tx.assocObj(),
    nodes
  );

  const path_data = ids =>
    ids
      .map((id, i) => `${i > 0 ? "L" : "M"} ${by_id[id].x},${by_id[id].y}`)
      .join(" ");

  sim.nodes(nodes);
  sim.force("center", d3.forceCenter());
  sim.force(
    "charge",
    d3.forceManyBody().strength(node => (node.dragging ? -500 : -200))
    //.distanceMax(250)
    //.theta(0.98)
  );
  // sim.force("x", d3.forceX());
  // sim.force("y", d3.forceY());

  const links_prop = rdf.namedNode("linksTo");
  const links = tx.transduce(
    tx.comp(
      tx.filter(([, p]) => p === links_prop),
      tx.map(([s, , o]) => ({
        source: by_id[s.value],
        target: by_id[o.value]
      })),
      tx.filter(_ => _.source && _.target)
    ),
    tx.push(),
    store.triples
  );

  sim.force(
    "grid",
    d3
      .forceLink(links)
      .id(_ => _.id)
      .strength(0.2)
      .iterations(2)
  );

  let search_path = [];
  hdom.renderOnce(["path.search.graph-path"], { root: svg_container });
  // // const hic2 = ["path.search", {}];
  // const search_path_ele = svg_container.appendChild(
  //   document.createElementNS(SVGNS, "path")
  // );
  // search_path_ele.classList.add("search", "graph-path");
  const search_path_ele = svg_container.querySelector(".search-path");

  const path_eles = new Map();
  for (const path of paths) {
    // const hic = ["path.solution", { d: "" }];
    const path_ele = document.createElementNS(SVGNS, "path");
    path_ele.classList.add("graph-path");
    path_eles.set(path, path_ele);
    svg_container.appendChild(path_ele);
  }

  const link_eles = new Map();
  for (const link of links) {
    const line = document.createElementNS(SVGNS, "line");
    line.classList.add("graph-edge");
    link_eles.set(link, line);
    svg_container.appendChild(line);
  }

  function update_positions(n) {
    properties_style.innerHTML = [
      ...tx.transduce(
        tx.comp(
          tx.map(triple => ({
            triple,
            source: by_id[triple[0].value],
            target: by_id[triple[2].value]
          })),
          tx.filter(_ => _.source && _.target),
          tx.map(({ triple, source, target }) => {
            const [s, p, o] = triple;
            const selector = `#${space_id} [data-subject="${
              s.value
            }"][data-object="${o.value}"]`;
            const { x: x1, y: y1 } = source;
            const { x: x2, y: y2 } = target;
            const top = y1.toFixed(2);
            const left = x1.toFixed(2);
            const width = (hypotenuse(x2 - x1, y2 - y1) || 1).toFixed(2);
            const angle = angle_between(x1, y1, x2, y2).toFixed(2);
            // The second translate is useful if you have a property in each
            // direction between two nodes.  More than that would be hard.
            return `${selector}{width:${width}px;transform: translate(${left}px,${top}px) rotate(${angle}rad) translateY(-50%);}`;
          })
        ),
        tx.push(),
        properties_to_show
      )
    ].join("\n");

    nodes_style.innerHTML = [
      ...tx.map(
        node =>
          `#${space_id} [data-node="${node.id}"] {top:${node.y}px;left:${
            node.x
          }px}`,
        nodes
      )
    ].join("\n");

    for (const [{ source, target }, line] of link_eles.entries()) {
      line.setAttribute("x1", source.x);
      line.setAttribute("y1", source.y);
      line.setAttribute("x2", target.x);
      line.setAttribute("y2", target.y);
    }

    for (const [ids, path] of path_eles.entries())
      path.setAttribute("d", path_data(ids));
  }

  // const tick_driver = rs.fromRAF();
  const tick_driver = rs.fromInterval(100);
  const ticks = rs.subscription();
  ticks.transform(tx.sideEffect(() => sim.tick()));
  tick_driver.subscribe(ticks);
  ticks.subscribe({ next: update_positions });

  // TRANSITIONAL
  // path_search_stuff(graph, svg_container, path_data);
}

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

const node_view = (_, x) => x.value;

const all_examples = [
  {
    name: "code-in-world",
    label: "simple claims",
    comment: `testing expression reader`,
    userland_code: `
claim(Alice.loves.Bob)
claim(Bob.likes.Alice)
`
  },
  {
    name: "boggle",
    label: "boggle with solutions",
    comment: `the full boggle example, with path search`,
    userland_code: `// board = boggle_grid(10, 10)
// set of search?
// etc
`,
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
      const { store } = make_store();
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
      return { store };
    }
  },
  {
    name: "trie-view-level-1",
    label: "trie level one",
    comment: `show the first node of a trie`,
    // DISABLED: not going to convert this to triples as such, too messy
    async get_resources() {
      const trie = await get_trie();
      return {
        node_view,
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
        node_view,
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
// trie match "qpoinspr"
// trie match "hello"
// trie match "world"
// trie node looks like render_trie_node
`,
    async get_store() {
      const trie = await get_trie();
      const node_view = render_trie_node;
      const { store } = make_store();
      store.into(sequence_as_triples(trie.scan("qpoinspr")));
      store.into(sequence_as_triples(trie.scan("hello")));
      store.into(sequence_as_triples(trie.scan("world")));

      return { store, node_view };
    }
  },
  {
    name: "graph2",
    label: "testing another graph",
    comment: `an example graph`,
    userland_code: `
a . value . Alice
b . value . Bob
c . value . Carol
d . value . Dave
a . linksTo . b
a . linksTo . c
b . linksTo . d
`,
    get_store() {
      const { store } = make_store();
      store.into([
        trip("a", "value", "Alice"),
        trip("b", "value", "Bob"),
        trip("c", "value", "Carol"),
        trip("d", "value", "Dave"),
        trip("a", "linksTo", "b"),
        trip("a", "linksTo", "c"),
        trip("b", "linksTo", "d")
      ]);
      // disabled for now
      // paths: [["a", "d"], ["b", "c", "d"]]
      return { store };
    }
  },
  {
    name: "graph3",
    label: "sequence as graph",
    comment: `turn a sequence into a graph`,
    userland_code: `list(Alice, Bob, Carol, Dave, Elon, Fran)`
  },
  {
    name: "symmetrical-1",
    label: "symmetrical property",
    comment: `a symmetrical property always applies in both directions`,
    userland_code: `
claim(Alice.knows.Bob)
claim(knows.isa.SymmetricalProperty)
make_it_a_rule_that({
  when: [$p.isa.SymmetricalProperty, $x.$p.$y],
  then: [$y.$p.$x]
});
`
  },
  {
    name: "range-1",
    label: "integer range",
    comment: `a range from zero up to the number`,
    userland_code: `range(10)`
  },
  {
    name: "cycle-1",
    label: "list cycle",
    comment: `make a list of the items with a linked head and tail`,
    userland_code: `range(10)`
  },
  {
    name: "graph4",
    label: "sequence as graph cycle",
    comment: `turn a sequence into a loop in a graph`,
    userland_code: `a = range(10)
b = cycle(a)
`,
    get_store() {
      const { store } = make_store();
      store.into(sequence_as_triples_cycle(tx.range(10)));
      return { store };
    }
  },
  {
    name: "graph5",
    label: "two separate structures on a graph",
    comment: `union of two independent generated sequences`,
    userland_code: `a = cycle(range(10))
b = range(20, 25)
`,
    get_store() {
      const { store } = make_store();
      store.into(sequence_as_triples_cycle(tx.range(10)));
      store.into(sequence_as_triples(tx.range(20, 25)));
      return { store };
    }
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
    "div.panes",
    [
      "div.description",
      [
        "header",
        ["h3", example.label],
        ["a", { href: `#${example.name}` }, example.name],
        ["p", example.comment]
      ],
      ["div.model-control", ["textarea.userland-code", example.userland_code]]
    ],
    ["figure.representation", {}, [dom_svg_space, { id: example.name }]]
  ]
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

function make_model_dataflow(model_spec) {
  const { name } = model_spec;
  const root = document.getElementById(model_spec.name);
  const container = root.querySelector(".space .html");
  const svg_container = root.querySelector(".space .everything");
  const code_box = root.querySelector("textarea");

  const model_resources = rs.metaStream(
    ({ store }) => resources_in(store),
    `${name}/store`
  );

  const model_store = rs.subscription();
  model_store.subscribe(model_resources);

  const model_code = rs.subscription();

  model_code.subscribe({
    next(code) {
      const store = get_store_from(code);
      if (store) model_store.next(store);
    }
  });

  const model_both = rs.sync({
    src: { store: model_store, resources: model_resources },
    id: `${name}-store-and-resources`
  });

  const ele = container.appendChild(document.createElement("div"));

  model_both.subscribe(
    tx.comp(
      tx.map(({ store: { store }, resources }) => [
        render_resource_nodes,
        { store, resources }
      ]),
      updateDOM({ root: ele })
    )
  );
  model_both.subscribe({
    next({ store, resources }) {
      force(
        name,
        resources,
        container.appendChild(document.createElement("div")),
        svg_container,
        store.node_view || node_view,
        store.store,
        []
      );
    }
  });

  rs.fromEvent(code_box, "input").transform(
    tx.map(event => event.target.value),
    tx.sideEffect(code => {
      model_code.next(code);
    })
  );

  if (model_spec.userland_code && !model_spec.get_store) {
    model_code.next(model_spec.userland_code);
    return;
  }

  (async function do_it(code) {
    const store = await model_spec.get_store();
    if (!store) return;
    model_store.next(store);
  })();
}

(async function() {
  const examples = all_examples.filter(_ => _.get_store || _.userland_code);

  hdom.renderOnce(render_examples(examples), { root: "examples" });

  for (const example of examples) make_model_dataflow(example);
})();
