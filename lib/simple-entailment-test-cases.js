const { make_identity_factory } = require("@def.codes/rdf-data-model");
const factory = make_identity_factory();
const { namedNode: n, blankNode: b, literal: l } = factory;

const TYPE = n("rdf:type"); // faux CURIE

exports["equivalent graphs"] = {
  a: [
    [n("Socrates"), TYPE, n("Athenian")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
  ],
  b: [
    [n("Socrates"), TYPE, n("Athenian")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
  ],
  a_entails_b: true,
  b_entails_a: true,
};

exports["one subject to blank node"] = {
  a: [
    [n("Socrates"), TYPE, n("Athenian")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
  ],
  b: [
    [b(), TYPE, n("Athenian")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
  ],
  a_entails_b: true,
  b_entails_a: false,
};

exports["one subject/object to same blank node"] = {
  a: [
    [n("Socrates"), TYPE, n("Athenian")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
  ],
  b: [
    [n("Socrates"), TYPE, b("a")],
    [b("a"), n("subclassOf"), n("Greek")],
  ],
  a_entails_b: true,
  b_entails_a: false,
};

exports["one subject and one object to blank nodes"] = {
  a: [
    [n("Socrates"), TYPE, n("Athenian")],
    [n("Plato"), n("studentOf"), n("Socrates")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
  ],
  b: [
    [n("Socrates"), TYPE, n("Athenian")],
    [b("x"), n("studentOf"), n("Socrates")],
    [n("Athenian"), n("subclassOf"), b("y")],
  ],
  a_entails_b: true,
  b_entails_a: false,
};

exports["one subject and one object to same blank node"] = {
  a: [
    [n("Socrates"), TYPE, n("Athenian")],
    [n("Plato"), n("studentOf"), n("Socrates")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
  ],
  b: [
    [n("Socrates"), TYPE, n("Athenian")],
    [b("x"), n("studentOf"), n("Socrates")],
    [n("Athenian"), n("subclassOf"), b("x")],
  ],
  a_entails_b: false, // I think!
  b_entails_a: false,
};
