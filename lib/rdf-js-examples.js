const { make_identity_factory } = require("@def.codes/rdf-data-model");
const factory = make_identity_factory();
const { namedNode: n, blankNode: b, literal: l } = factory;

const TYPE = n("rdf:type"); // faux CURIE

exports.symmetric_property = [
  [n("Bob"), n("fatherOf"), n("John")],
  [n("Alice"), n("hasSpouse"), n("Bob")],
  [n("Bob"), n("hasSpouse"), n("Alice")],
  [n("Carol"), n("loves"), n("Alice")],
];

exports.symmetric_property_with_bnodes = [
  ...exports.symmetric_property,
  [n("Alice"), n("hasLoveChild"), b("x")],
  [b("y"), n("hasLoveChild"), n("Bob")],
];

exports.simple_records = [
  [n("Aria"), n("age"), l(9)],
  [n("Tremé"), n("age"), l(7)],
  [n("Kim"), n("age"), l(39)],
  [n("Gavin"), n("age"), l(41)],
];

const b1 = b("1");
exports.with_bnode = [
  [b1, n("age"), l(9)],
  [b1, n("weight"), l(42)],
  [b1, n("height"), l(128)],
  [b1, n("SSN"), l("123-45-6789")],
];
