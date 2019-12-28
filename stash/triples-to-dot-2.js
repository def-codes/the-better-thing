const { DOT, TYPES } = require("@def.codes/graphviz-format");
const { NODE, EDGE } = TYPES;

const { TripleStore } = require("@thi.ng/rstream-query");
const { make_identity_factory } = require("@def.codes/rdf-data-model");
const factory = make_identity_factory();
const { namedNode: n, blankNode: b, literal: l } = factory;

const store = new TripleStore();
store.add([n("dolphins"), n(`rdf:type`), n(NODE)]);
store.add([n("dolphins"), n(`${DOT}shape`), l("circle")]);
store.add([n("breath"), n(`rdf:type`), n(NODE)]);
store.add([n("breath"), n(`${DOT}shape`), l("circle")]);
const dolphin_breath = b();
store.add([dolphin_breath, n(`rdf:type`), n(EDGE)]);
store.add([dolphin_breath, n(`${DOT}from`), n("dolphins")]);
store.add([dolphin_breath, n(`${DOT}to`), n("breath")]);
store.add([dolphin_breath, n(`${DOT}style`), l("dotted")]);

const { dot_interpret_rdf_store } = require("./lib/dot-interpret-rdf-store");
const dot_statements = [...dot_interpret_rdf_store(store)];

const { rdfjs_store_to_dot_statements } = require("./lib/rdf-js-to-dot");
//const dot_statements = [...rdfjs_store_to_dot_statements(store)];

exports.display = { dot_statements };
