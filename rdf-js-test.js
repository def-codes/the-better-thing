const tx = require("@thi.ng/transducers");
const { TripleStore } = require("@thi.ng/rstream-query");
const { make_identity_factory } = require("@def.codes/rdf-data-model");
const dot = require("@def.codes/graphviz-format");
const { rdfjs_store_to_dot_statements } = require("./lib/rdf-js-to-dot");

const factory = make_identity_factory();
const { namedNode: n, blankNode: b, literal: l } = factory;

const store = new TripleStore();
store.add([n("Bob"), n("age"), l(35, n("xsd:integer"))]);
store.add([n("Bob"), n("fatherOf"), n("Joe")]);
store.add([n("Alice"), n("hasSpouse"), n("Bob")]);
store.add([n("Bob"), n("hasSpouse"), n("Alice")]);
store.add([n("Jill"), n("loves"), n("Alice")]);

exports.display = { dot_statements: [...rdfjs_store_to_dot_statements(store)] };
