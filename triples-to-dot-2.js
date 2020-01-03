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

const is_blank_node = term => term.termType === "BlankNode";
const find_blank_nodes = store =>
  tx.iterator(
    tx.filter(is_blank_node),
    tx.concat(store.indexS.keys(), store.indexO.keys())
  );

// all this is a hack based on a defunct approach to dot mapping
function mark_bnodes(store) {
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
          [bn, n(`${DOT}color`), l("red")],
        ])
      ),
      find_blank_nodes(store)
    )
  );
}

function make_dot_store_from(store) {
  const dot_store = new RDFTripleStore();
  dot_store.into(triples_to_dot_description(store));
  mark_bnodes(dot_store);
  return dot_store;
}

function get_source_triples() {
  const { some_object_graph } = require("./lib/test-object-graph");
  const { some_ast } = require("./lib/some-ast");
  const { evaluate_cases } = require("./lib/evaluate-cases");
  const {
    simple_records,
    symmetric_property_with_bnodes,
  } = require("./lib/rdf-js-examples");
  // const trips = [...rdf_js_traversal(evaluate_cases)];
  trips = [...symmetric_property_with_bnodes, [n("a"), n("b"), n("c")]];
  // const thing = trips;

  // store.add([n("dolphins"), n(`${DOT}shape`), l("circle")]);
  // store.add([b("b2536"), n(`${DOT}color`), l("red")]);
}

function get_entail_case(n = 0) {
  const entail_cases = require("./lib/simple-entailment-test-cases");
  return Object.values(entail_cases)[n];
}

const store_from = triples => {
  const store = new RDFTripleStore();
  store.into(triples);
  return store;
};

const case_number = 4;
const source_store_1 = store_from(get_entail_case(case_number).a);
const dot_store_1 = make_dot_store_from(source_store_1);
const dot_statements_1 = [...dot_interpret_rdf_store(dot_store_1)];

const source_store_2 = store_from(get_entail_case(case_number).b);
const dot_store_2 = make_dot_store_from(source_store_2);
const dot_statements_2 = [...dot_interpret_rdf_store(dot_store_2)];

// mark_node(dot_store_1, n("Bob"));
// mark_edge(dot_store_1, n("Carol"), n("Alice"));

// const dot_statements = [...rdfjs_store_to_dot_statements(blah)];

// exports.display = { things: [...tx.flatten(thing)] };

// exports.display = { dot_statements };
exports.display = {
  dot_statements: [...dot_statements_1, ...dot_statements_2],
};
//exports.display = { dot_graph: { strict: false, statements: dot_statements } };
