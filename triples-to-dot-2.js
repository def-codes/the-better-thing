const { DOT, TYPES } = require("@def.codes/graphviz-format");
const { NODE, EDGE } = TYPES;
const { TripleStore } = require("@thi.ng/rstream-query");
const { make_identity_factory } = require("@def.codes/rdf-data-model");
const { traverse } = require("@def.codes/graphs");
const {
  make_object_graph_traversal_spec,
} = require("@def.codes/node-web-presentation");

const factory = make_identity_factory();
const { namedNode: n, blankNode: b, literal: l, normalize } = factory;

const normalize_triple = triple => triple.map(normalize);

const { some_object_graph } = require("./lib/test-object-graph");
const { some_ast } = require("./lib/some-ast");
const { evaluate_cases } = require("./lib/evaluate-cases");
const { simple_records, symmetric_property } = require("./lib/rdf-js-examples");
// const trips = [...rdf_js_traversal(evaluate_cases)];
const trips = simple_records;
// console.log(`facts`, trips);
const thing = trips;

const store = new TripleStore();
for (const trip of trips) store.add(normalize_triple(trip));
// store.add([n("dolphins"), n(`${DOT}shape`), l("circle")]);
// store.add([b("b2536"), n(`${DOT}color`), l("red")]);

const {
  triples_to_dot_description,
} = require("./lib/triples-to-dot-description");
const blah = [...triples_to_dot_description(store)];
// blah.push([b("1234"), n(`${DOT}color`), l("red")]);
// blah.push([n("5"), n(`${DOT}color`), l("red")]);
// blah.push([n("5"), n(`${DOT}style`), l("filled")]);
blah.push([n("Aria"), n(`${DOT}style`), l("filled")]);
blah.push([n("Aria"), n(`${DOT}color`), l("red")]);

const { dot_interpret_rdf_store } = require("./lib/dot-interpret-rdf-store");
//const dot_statements = [...dot_interpret_rdf_store(store)];
const dot_statements = [...dot_interpret_rdf_store(blah)];

const { rdfjs_store_to_dot_statements } = require("./lib/rdf-js-to-dot");
// const dot_statements = [...rdfjs_store_to_dot_statements(blah)];

// const tx = require("@thi.ng/transducers");
// exports.display = { things: [...tx.flatten(thing)] };

exports.display = { dot_statements };
