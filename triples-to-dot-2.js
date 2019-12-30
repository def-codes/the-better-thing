const { DOT, TYPES } = require("@def.codes/graphviz-format");
const { NODE, EDGE } = TYPES;
// const { RDFTripleStore } = require("@thi.ng/rstream-query");
const { RDFTripleStore } = require("@def.codes/rstream-query-rdf");
const { make_identity_factory } = require("@def.codes/rdf-data-model");
const { traverse } = require("@def.codes/graphs");
const {
  make_object_graph_traversal_spec,
} = require("@def.codes/node-web-presentation");

const factory = make_identity_factory();
const { namedNode: n, blankNode: b, literal: l, variable: v } = factory;

const { some_object_graph } = require("./lib/test-object-graph");
const { some_ast } = require("./lib/some-ast");
const { evaluate_cases } = require("./lib/evaluate-cases");
const { simple_records, symmetric_property } = require("./lib/rdf-js-examples");
// const trips = [...rdf_js_traversal(evaluate_cases)];
const trips = symmetric_property;
// console.log(`facts`, trips);
const thing = trips;

const store = new RDFTripleStore();
for (const trip of trips) store.add(trip);
// store.add([n("dolphins"), n(`${DOT}shape`), l("circle")]);
// store.add([b("b2536"), n(`${DOT}color`), l("red")]);

const {
  triples_to_dot_description,
} = require("./lib/triples-to-dot-description");
const name = "Bob";
const store2 = new RDFTripleStore();
store2.into([
  ...triples_to_dot_description(store),
  [n(name), n(`${DOT}style`), l("filled")],
  [n(name), n(`${DOT}color`), l("red")],
  [n(name), n(`${DOT}shape`), l("circle")],
]);

const { sync_query } = require("@def.codes/rstream-query-rdf");
// const results = sync_query(store, [[n("Carol"), n("loves"), v("lover")]]);
// console.log(`results`, results);

const find_dot_edges = (store, from, to) =>
  Array.from(
    sync_query(store, [
      [v("edge"), n("rdf:type"), n(EDGE)],
      [v("edge"), n(`${DOT}from`), from],
      [v("edge"), n(`${DOT}to`), to],
    ]) || [],
    _ => _.edge
  );

const dot_edges = find_dot_edges(store2, n("Carol"), n("Alice"));
if (dot_edges) {
  const [dot_edge] = dot_edges;
  console.log(`dot_edge`, dot_edge);
  if (dot_edge) store2.into([[dot_edge, n(`${DOT}color`), l("green")]]);
}

const { dot_interpret_rdf_store } = require("./lib/dot-interpret-rdf-store");
//const dot_statements = [...dot_interpret_rdf_store(store)];
const dot_statements = [...dot_interpret_rdf_store(store2)];

const { rdfjs_store_to_dot_statements } = require("./lib/rdf-js-to-dot");
// const dot_statements = [...rdfjs_store_to_dot_statements(blah)];

// const tx = require("@thi.ng/transducers");
// exports.display = { things: [...tx.flatten(thing)] };

exports.display = { dot_statements };
