// TRANSITIONAL.  Needs to change to a more pure read that doesn't have (at
// least write) access to a store and where “macros” really just return
// rewritten code.

//==========================  MACRO HELPERS

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

const node_or_blank = x => (is_node(x) ? x : mint_blank());

// We're not actually changing to RDF triples as such...
// just using RDF terms with rstream-query-style tuples
const trip = (s, p, o) => [
  typeof s === "string" ? rdf.namedNode(s) : s,
  typeof p === "string" ? rdf.namedNode(p) : p,
  !o || !o.termType ? rdf.literal(o) : o
];

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

// ========================================  traversal (old)

const all_values_for = (store, subject, property) =>
  tx.pluck(
    "object",
    sync_query(store, [[subject, property, rdf.variable("object")]]) || []
  );

const all_properties_for = (store, subject) =>
  sync_query(store, [
    [subject, rdf.variable("property"), rdf.variable("object")]
  ]) || [];

// iterate all resources reachable by `follow` property from `start`
// DEPRECATING: see traversal-driver
function traverse(store, start, follow) {
  const queue = [];
  if (store.indexS.has(start)) queue.push(start);
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

const make_world = store => {
  const { namedNode: n, variable: v, literal: l } = rdf;

  // named node or variable
  const nv = key => (key[0] === "$" ? v(key.slice(1)) : n(key));

  // maybe literal: take as literal unless already a term
  const ml = val => (val.termType ? val : l(val));

  // default context.  treat expressions kind of like turtle
  // we can't tell whether brackets or dot was used for get
  // so we treat all keys as tokens (terms)
  // Actually would need to recur here (as_turtle) on s & p, etc
  const TURTLE_PATTERNS = [
    ([{ key: s }, { key: p }, { key: o }]) => [nv(s), nv(p), nv(o)],
    // prettier-ignore
    ([{ key: s }, { key: p }, { args: [o]}]) => [nv(s), nv(p), ml(o)]
    // ^ could the literal position meaningfully be a variable there?
  ];

  const as_turtle = expression =>
    expression && match(TURTLE_PATTERNS, expression.context);

  // TODO: these older adapters are retained only for rules
  // should be able to use `as_turtle` now, right?
  const as_term = step =>
    step.key[0] === "$" ? `?${step.key.slice(1)}` : rdf.namedNode(step.key);
  const as_triple = _ => _.context.map(as_term);

  const reify_triple = id => ([s, p, o]) => [
    [id, n("hasSubject"), s],
    [id, n("hasPredicate"), p],
    [id, n("hasObject"), o]
  ];

  const query = (...clauses) => {
    const query_id = mint_blank();
    const reified_clauses = clauses
      .map(as_turtle)
      .map(reify_triple(mint_blank()));

    const all = [
      ...tx.mapcat(x => x, reified_clauses),
      ...reified_clauses.map(reified => [
        query_id,
        n("hasClause"),
        reified[0][0]
      ])
    ];
    // TEMP: assert the query
    store.into(all);

    return query_id;
  };

  //       //  OBE
  // const query = (...clauses) => read =>
  //   store
  //     .addQueryFromSpec({ q: [{ where: clauses.map(as_triple) }] })
  //     .subscribe(tx.comp(tx.flatten(), tx.map(read)));

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

      // Recognize resources with iterable runtime values
      // doesn't work in current examples, though, because of order
      const maybe_term = as_named(subjects);
      if (maybe_term) {
        // get subject's value property and see whether it's a runtime iterable
        const values = all_values_for(store, maybe_term, VALUE);
        if (o && p)
          store.into(tx.map(s => [is_node(s) ? s : as_named(s), p, o], values));
        return;
      }

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
            // THIS is in boggle.js
            neighbors_of_index(size, n)
          )
        ),

        tx.range(rows * cols)
      );

      // this should be a separate step
      store.into(links);
    },
    // OBE: use real rules
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
