const tx = require("@thi.ng/transducers");
const { DOT, TYPES } = require("@def.codes/graphviz-format");
const { NODE, EDGE } = TYPES;
const { RDFTripleStore, factory } = require("@def.codes/rstream-query-rdf");
const {
  triples_to_dot_description,
} = require("./lib/triples-to-dot-description");
const { sync_query } = require("@def.codes/rstream-query-rdf");
const { dot_interpret_rdf_store } = require("./lib/dot-interpret-rdf-store");
const { rdfjs_store_to_dot_statements } = require("./lib/rdf-js-to-dot");

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
const find_blank_nodes = store =>
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
      find_blank_nodes(store)
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

const entail_cases = require("./lib/simple-entailment-test-cases");
function do_entail_case(number = 8) {
  const [name, entail_case] = Object.entries(entail_cases)[case_number];
  const source_store_1 = store_from(entail_case.a);
  const dot_store_1 = make_dot_store_from(source_store_1, "blue");
  const dot_statements_1 = [...dot_interpret_rdf_store(dot_store_1)];

  const source_store_2 = store_from(entail_case.b);
  const dot_store_2 = make_dot_store_from(source_store_2, "red");
  const dot_statements_2 = [...dot_interpret_rdf_store(dot_store_2)];

  // const dot_statements = [...rdfjs_store_to_dot_statements(blah)];
  // exports.display = { things: [...tx.flatten(thing)] };
  return [name, dot_statements_1, dot_statements_2];
}

function case_statements(number) {
  const [name, dot_statements_1, dot_statements_2] = do_entail_case(number);

  const merged_statements = [...dot_statements_1, ...dot_statements_2];

  const { prefix_statement_keys } = require("./lib/clustering");
  const side_by_side_statements = [
    {
      type: "subgraph",
      id: "cluster a",
      statements: [...prefix_statement_keys("a")(dot_statements_1)],
    },
    {
      type: "subgraph",
      id: "cluster b",
      statements: [...prefix_statement_keys("b")(dot_statements_2)],
    },
  ];
  // const side_by_side_statements = [
  //   ...prefix_statement_keys("a")(dot_statements_1),
  //   ...prefix_statement_keys("b")(dot_statements_2),
  // ];
  return [name, side_by_side_statements, merged_statements];
}

let case_number = 10;
// case_number = Object.keys(entail_cases).length - 1;
const [case_name, clusters, merged] = case_statements(case_number);
const dot_statements = [clusters, merged][1];

exports.display = {
  // dot_statements,
  dot_graph: {
    directed: true,
    strict: false,
    attributes: {
      // rankdir: "LR",
      label: case_name,
      splines: false,
    },
    statements: dot_statements,
  },
};
