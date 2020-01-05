const tx = require("@thi.ng/transducers");
const { equiv } = require("@thi.ng/equiv");
const { DOT, TYPES } = require("@def.codes/graphviz-format");
const { NODE, EDGE } = TYPES;
const { RDFTripleStore, factory } = require("@def.codes/rstream-query-rdf");
const {
  triples_to_dot_description,
} = require("./lib/triples-to-dot-description");
const { sync_query } = require("@def.codes/rstream-query-rdf");
const { dot_interpret_rdf_store } = require("./lib/dot-interpret-rdf-store");
const { rdfjs_store_to_dot_statements } = require("./lib/rdf-js-to-dot");
const { prefix_statement_keys } = require("./lib/clustering");
const entail_cases = require("./lib/simple-entailment-test-cases");

const { namedNode: n, blankNode: b, literal: l, variable: v } = factory;

const TYPE = n("rdf:type");

function mark_node(store, node) {
  store.into([
    [node, n(`${DOT}style`), l("filled")],
    [node, n(`${DOT}color`), l("red")],
    [node, n(`${DOT}shape`), l("circle")],
  ]);
}

function mark_edge(store, from, to) {
  const dot_edges = find_dot_edges(store, from, to);
  if (dot_edges) {
    const [dot_edge] = dot_edges;
    console.log(`dot_edge`, dot_edge);
    if (dot_edge) store.into([[dot_edge, n(`${DOT}color`), l("green")]]);
  }
}

const find_dot_edges = (store, from, to) =>
  Array.from(
    sync_query(store, [
      [v("edge"), TYPE, n(EDGE)],
      [v("edge"), n(`${DOT}from`), from],
      [v("edge"), n(`${DOT}to`), to],
    ]) || [],
    _ => _.edge
  );

const find_all_dot_edges = store =>
  Array.from(
    sync_query(store, [[v("edge"), TYPE, n(EDGE)]]) || [],
    _ => _.edge
  );

const is_blank_node = term => term.termType === "BlankNode";
const bnodes_in = store =>
  tx.iterator(
    tx.filter(is_blank_node),
    tx.concat(store.indexS.keys(), store.indexO.keys())
  );

// all this is a hack based on a defunct approach to dot mapping
function mark_bnodes(store, color = "red") {
  store.into(
    tx.iterator(
      tx.comp(
        // edges are blank nodes
        tx.filter(node => !store.has([node, TYPE, n(EDGE)])),
        tx.mapcat(bn => [
          [bn, n(`${DOT}shape`), l("square")],
          [bn, n(`${DOT}label`), l("")],
          [bn, n(`${DOT}width`), l(0.1)],
          [bn, n(`${DOT}style`), l("filled")],
          [bn, n(`${DOT}color`), l(color)],
        ])
      ),
      bnodes_in(store)
    )
  );
}

function mark_edges(store, color = "red") {
  store.into(
    tx.mapcat(
      bn => [
        [bn, n(`${DOT}color`), l(color)],
        [bn, n(`${DOT}fontcolor`), l(color)],
        // hack, so you can see both colors.  could pass in other attrs, etc
        [bn, n(`${DOT}style`), l(color === "red" ? "dashed" : "solid")],
      ],
      find_all_dot_edges(store)
    )
  );
}

function make_dot_store_from(store, color = "red") {
  const dot_store = new RDFTripleStore();
  dot_store.into(triples_to_dot_description(store));
  mark_bnodes(dot_store, color);
  mark_edges(dot_store, color);
  return dot_store;
}

/* other sources
function get_source_triples() {
  const { some_object_graph } = require("./lib/test-object-graph");
  const { some_ast } = require("./lib/some-ast");
  const { evaluate_cases } = require("./lib/evaluate-cases");
  const {
    simple_records,
    symmetric_property_with_bnodes,
  } = require("./lib/rdf-js-examples");
}
*/

const store_from = triples => {
  const store = new RDFTripleStore();
  store.into(triples);
  return store;
};

function do_item(triples, color) {
  const source = store_from(triples);
  const dot_store = make_dot_store_from(source, color);
  const dot_statements = [...dot_interpret_rdf_store(dot_store)];
  return { source, dot_store, dot_statements };
}

const do_entail_case = entail_case => ({
  a: do_item(entail_case.a, "blue"),
  b: do_item(entail_case.b, "red"),
});

const make_dot_edge = (from, to, attrs = {}) => {
  const edge = b();
  return [
    [edge, TYPE, n(EDGE)],
    [edge, n(`${DOT}from`), from],
    [edge, n(`${DOT}to`), to],
    ...Object.entries(attrs).map(([k, v]) => [edge, n(`${DOT}${k}`), l(v)]),
  ];
};

function case_statements(entail_case) {
  const { a, b } = do_entail_case(entail_case);

  const merged = [...a.dot_statements, ...b.dot_statements];
  const clusters = [
    {
      type: "subgraph",
      id: "cluster a",
      statements: [...prefix_statement_keys("a")(a.dot_statements)],
    },
    {
      type: "subgraph",
      id: "cluster b",
      statements: [...prefix_statement_keys("b")(b.dot_statements)],
    },
  ];
  // const side_by_side_statements = [
  //   ...prefix_statement_keys("a")(dot_statements_1),
  //   ...prefix_statement_keys("b")(dot_statements_2),
  // ];
  return { a, b, merged, clusters };
}

/*
  Goal: find a mapping for bnodes in B to nodes in A.  A nodes may be reused.

  A search state is
  - A : the graph that might entail B
  - B : the graph that might be entailed
  - mappings : a partial mapping of B's bnode names to nodes in A
  - node : the blank node of B's that you're currently visiting (looking at)
  - seen : states that have been visited?  (i.e. mappings, equivmap)
  - stack : a set of nodes currently... do you need this if you already have mapping?

  Assumes that mapping is partial if you're still looking at?
  Looking at must not be in mappings.
  I don't think that looking-at is part of state

  A solution is a complete mapping, viz one with as many entries as B has bnodes.

  moves from a given mapping can be to other, more complete mappings
  - partial mappings are always valid as far as they go
  - but they might be a dead end
  - don't you need equivmap to keep from revisiting old states?
*/

// given a state, produce possible moves
// no moves means dead end
// yields once for each possible match/scenario for given node
function* process_state({ A, B, mapping, looking_at: node }) {
  // construct a query for A
  const clauses = (idx, f) => tx.map(i => f(B.triples[i]), idx.get(node) || []);
  const sub = n => (is_blank_node(n) ? mapping[n.value] || v(n.value) : n);
  const query = [
    ...clauses(B.indexS, ([, p, o]) => [v("ZZZ"), p, sub(o)]),
    ...clauses(B.indexO, ([s, p]) => [sub(s), p, v("ZZZ")]),
  ];

  // others are conditional because you still have to look at them
  for (const { ZZZ, ...conditions } of sync_query(A, query) || [])
    yield { match: { [node.value]: ZZZ }, conditions };
}

// Tell whether `a` entails `b`, and if so include a mapping of `b`'s bnodes to
// terms in `a`.  an `a` node may be used multiple times
function* simple_entailment_mapping(A, B) {
  // const queue = Array.from(bnodes_in(B), _ => ({ looking_at: _, mapping: {} }));
  // const target_size = queue.length;

  const dump = {};
  const EMPTY = {};
  for (const looking_at of bnodes_in(B)) {
    const matches = [...process_state({ A, B, looking_at, mapping: EMPTY })];
    if (matches.length === 0) {
      console.log(`yes, we have no bananas I mean match for ${looking_at}`);
      return;
    }
    const unconditional = matches.find(_ => !Object.keys(_.conditions).length);
    if (unconditional) {
      console.log(`at least one match is unconditional!`, unconditional);
      // add this to mapping for all future nodes
      // check whether it matches conditions of all previous matches
      // but what if it doesn't & you have another unconditional match that does?
    } else {
      console.log(`lovely, all matches are conditional`, ...matches);
      // check whether any conditions
    }
    // if (matches.length === 1)
    dump[looking_at.value] = matches;
  }

  // construct a SAT problem from the bnode findings
  // for each pairing that results indicate is possible
  // I mean... we should eliminate ones that we know are unconditionally true

  for (const [key, matches] of Object.entries(dump)) {
    console.log(`${key} matches`);
    for (const { match, conditions } of matches) {
      console.log(
        `  ${match[key]} if`,
        Object.entries(conditions)
          .map(([k, v]) => `${k} => ${v}`)
          .join(" & ")
      );
    }
  }

  const var_name = (s, t) => `${s}?${t}`;

  const clauses = [];
  const model = {};
  for (const [key, matches] of Object.entries(dump)) {
    // console.log(`${key} matches`);
    for (const { match, conditions } of matches) {
      // console.log(`match, conditions`, match, conditions);

      const cond = Object.entries(conditions);
      const v1 = var_name(key, match[key]);
      const clauses = Object.entries(conditions)
        .map(([k, v]) => var_name(k, v))
        .join(" & ");

      console.log(`  ${v1} -> (${clauses})`);
    }
  }
}

// mark algorithm state
function mark_algorithm(A, B) {
  const store = new RDFTripleStore();

  for (const [from, targets] of simple_entailment_mapping(A.source, B.source))
    for (const candidate of targets)
      store.into([
        // what we really mean is the node representing Socrates
        // ...make_dot_edge(n("Socrates"), n("Greek"), {
        ...make_dot_edge(from, candidate, {
          constraint: false,
          color: "#FF00FF88",
          penwidth: 5,
        }),
      ]);

  return dot_interpret_rdf_store(store);
}

// this no longer really plays well with clusters mode
function do_case(number = 0, mode = 0) {
  const [case_name, entail_case] = Object.entries(entail_cases)[number];
  const { a: A, b: B, clusters, merged } = case_statements(entail_case);
  const base_dot_statements = [merged, clusters][mode];
  return {
    type: "subgraph",
    id: `cluster case ${number}`,
    attributes: { label: case_name },
    statements: prefix_statement_keys(`c${number} `)([
      ...base_dot_statements,
      ...mark_algorithm(A, B),
    ]),
  };
}

// case_number = Object.keys(entail_cases).length - 1;
const dot_statements = Object.keys(Object.keys(entail_cases)).map(idx =>
  do_case(idx, 0)
);

exports.display = {
  // dot_statements,
  dot_graph: {
    directed: true,
    node_attributes: {
      // shape: "circle",
    },
    edge_attributes: {
      // minlen: 50,
    },
    attributes: {
      rankdir: "LR",
      // layout: "fdp",
      concentrate: false,
      newrank: true,
      splines: false,
    },
    statements: dot_statements,
  },
};
