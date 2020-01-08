// const { inspect } = require("util");
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
const { constructors } = require("./lib/simple-logic");
const { rdfjs_store_to_dot_statements } = require("./lib/rdf-js-to-dot");
const { prefix_statement_keys } = require("./lib/clustering");
const entail_cases = require("./lib/simple-entailment-test-cases");
const { bnodes_in, simple_entailment_mapping } = require("./lib/graph-ops");

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

// mark algorithm state
function mark_algorithm(A, B) {
  const store = new RDFTripleStore();

  const mapping = simple_entailment_mapping(A.source, B.source);
  for (const [from, target] of mapping) {
    console.log(`from, target`, from, target);
    store.into([
      // what we really mean is the node representing Socrates
      // ...make_dot_edge(n("Socrates"), n("Greek"), {
      ...make_dot_edge(from, target, {
        constraint: false,
        color: "#FF00FF88",
        penwidth: 5,
      }),
    ]);
  }

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
      // splines: false,
    },
    statements: dot_statements,
  },
};
