const { DOT, TYPES } = require("@def.codes/graphviz-format");
const { NODE, EDGE } = TYPES;
const { TripleStore } = require("@thi.ng/rstream-query");
const { make_identity_factory } = require("@def.codes/rdf-data-model");
const { traverse } = require("@def.codes/graphs");
const {
  make_object_graph_traversal_spec,
} = require("@def.codes/node-web-presentation");

const factory = make_identity_factory();
const { namedNode: n, blankNode: b, literal: l } = factory;

// in nwp
const is_reference_type = x =>
  x && (typeof x === "object" || typeof x === "function");

function* rdf_js_traversal(thing) {
  const spec = make_object_graph_traversal_spec();
  for (const { subject, object, value, data } of traverse([thing], spec))
    if (object != null) yield [b(subject), n(data), b(object)];
    else if (typeof value === "object")
      for (const [k, v] of Object.entries(value))
        if (!is_reference_type(v)) yield [b(subject), n(k), l(v)];
}

const { some_object_graph } = require("./lib/test-object-graph");
const { some_ast } = require("./lib/some-ast");
const { evaluate_cases } = require("./lib/evaluate-cases");
const trips = [...rdf_js_traversal(evaluate_cases)];
console.log(`facts`, trips);

const store = new TripleStore();
for (const trip of trips) store.add(trip);
// store.add([n("dolphins"), n(`rdf:type`), n(NODE)]);
// store.add([n("dolphins"), n(`${DOT}shape`), l("circle")]);
// store.add([n("breath"), n(`rdf:type`), n(NODE)]);
// store.add([n("breath"), n(`${DOT}shape`), l("circle")]);
// const dolphin_breath = b();
// store.add([dolphin_breath, n(`rdf:type`), n(EDGE)]);
// store.add([dolphin_breath, n(`${DOT}from`), n("dolphins")]);
// store.add([dolphin_breath, n(`${DOT}to`), n("breath")]);
// store.add([dolphin_breath, n(`${DOT}style`), l("dotted")]);

const { dot_interpret_rdf_store } = require("./lib/dot-interpret-rdf-store");
//const dot_statements = [...dot_interpret_rdf_store(store)];

const { rdfjs_store_to_dot_statements } = require("./lib/rdf-js-to-dot");
const dot_statements = [...rdfjs_store_to_dot_statements(store)];

exports.display = { dot_statements };
