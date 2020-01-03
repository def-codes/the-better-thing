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

exports["one subject to bnode"] = {
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

exports["one subject/object to same bnode"] = {
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

exports["one subject and one object to bnode"] = {
  a: [
    [n("Socrates"), TYPE, n("Athenian")],
    [n("Plato"), n("studentOf"), n("Socrates")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
    [n("Plato"), n("authorOf"), n("Symposium")],
  ],
  b: [
    [n("Socrates"), TYPE, n("Athenian")],
    [b("x"), n("studentOf"), n("Socrates")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
    [b("y"), n("authorOf"), n("Symposium")],
  ],
  a_entails_b: true,
  b_entails_a: false,
};

exports["one subject and one object to same bnode"] = {
  a: [
    [n("Socrates"), TYPE, n("Athenian")],
    [n("Plato"), n("studentOf"), n("Socrates")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
    [n("Plato"), n("authorOf"), n("Symposium")],
  ],
  b: [
    [n("Socrates"), TYPE, n("Athenian")],
    [b("x"), n("studentOf"), n("Socrates")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
    [b("x"), n("authorOf"), n("Symposium")],
  ],
  a_entails_b: true,
  b_entails_a: false,
};

exports["identical graphs with a corresponding bnode in two subjects"] = {
  a: [
    [n("Socrates"), TYPE, n("Athenian")],
    [b("y"), n("studentOf"), n("Socrates")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
    [b("y"), n("authorOf"), n("Symposium")],
  ],
  b: [
    [n("Socrates"), TYPE, n("Athenian")],
    [b("x"), n("studentOf"), n("Socrates")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
    [b("x"), n("authorOf"), n("Symposium")],
  ],
  a_entails_b: true,
  b_entails_a: true,
};

exports["union merge on one bnode"] = {
  a: [
    [n("Socrates"), TYPE, n("Athenian")],
    [b("x"), n("studentOf"), n("Socrates")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
    [b("x"), n("authorOf"), n("Symposium")],
  ],
  b: [
    [n("Socrates"), TYPE, n("Athenian")],
    [b("x"), n("studentOf"), n("Socrates")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
    [b("y"), n("authorOf"), n("Symposium")],
  ],
  a_entails_b: true, // ?
  b_entails_a: false, // ?
};

exports["two reified statements with one shared term"] = {
  a: [
    [b("w"), n("rdf:subject"), n("Socrates")],
    [b("w"), n("rdf:predicate"), TYPE],
    [b("w"), n("rdf:object"), n("Athenian")],
    [b("x"), n("rdf:subject"), n("Athenian")],
    [b("x"), n("rdf:predicate"), n("subclassOf")],
    [b("x"), n("rdf:object"), n("Greek")],
  ],
  b: [
    [b("y"), n("rdf:subject"), n("Socrates")],
    [b("y"), n("rdf:predicate"), TYPE],
    [b("y"), n("rdf:object"), n("Athenian")],
    [b("z"), n("rdf:subject"), n("Athenian")],
    [b("z"), n("rdf:predicate"), n("subclassOf")],
    [b("z"), n("rdf:object"), n("Greek")],
  ],
  a_entails_b: true,
  b_entails_a: true,
};

exports["two reified statements with one shared bnode"] = {
  a: [
    [b("w"), n("rdf:subject"), n("Socrates")],
    [b("w"), n("rdf:predicate"), TYPE],
    [b("w"), n("rdf:object"), b("a")],
    [b("x"), n("rdf:subject"), b("a")],
    [b("x"), n("rdf:predicate"), n("subclassOf")],
    [b("x"), n("rdf:object"), n("Greek")],
  ],
  b: [
    [b("y"), n("rdf:subject"), n("Socrates")],
    [b("y"), n("rdf:predicate"), TYPE],
    [b("y"), n("rdf:object"), b("b")],
    [b("z"), n("rdf:subject"), b("b")],
    [b("z"), n("rdf:predicate"), n("subclassOf")],
    [b("z"), n("rdf:object"), n("Greek")],
  ],
  a_entails_b: true,
  b_entails_a: true,
};

exports["two reified statements with multiple bnodes"] = {
  a: [
    [b("w"), n("rdf:subject"), n("Socrates")],
    [b("w"), n("rdf:predicate"), b("a")],
    [b("w"), n("rdf:object"), b("b")],
    [b("x"), n("rdf:subject"), b("b")],
    [b("x"), n("rdf:predicate"), n("subclassOf")],
    [b("x"), n("rdf:object"), n("Greek")],
  ],
  b: [
    [b("y"), n("rdf:subject"), n("Socrates")],
    [b("y"), n("rdf:predicate"), b("c")],
    [b("y"), n("rdf:object"), b("d")],
    [b("z"), n("rdf:subject"), b("d")],
    [b("z"), n("rdf:predicate"), n("subclassOf")],
    [b("z"), n("rdf:object"), n("Greek")],
  ],
  a_entails_b: true,
  b_entails_a: true,
};

exports["two reified statements shared versus split bnodes"] = {
  a: [
    [b("w"), n("rdf:subject"), n("Socrates")],
    [b("w"), n("rdf:predicate"), b("a")],
    [b("w"), n("rdf:object"), b("b")],
    [b("x"), n("rdf:subject"), b("b")],
    [b("x"), n("rdf:predicate"), n("subclassOf")],
    [b("x"), n("rdf:object"), n("Greek")],
  ],
  b: [
    [b("y"), n("rdf:subject"), n("Socrates")],
    [b("y"), n("rdf:predicate"), b("c")],
    [b("y"), n("rdf:object"), b("d")],
    [b("z"), n("rdf:subject"), b("e")],
    [b("z"), n("rdf:predicate"), n("subclassOf")],
    [b("z"), n("rdf:object"), n("Greek")],
  ],
  a_entails_b: true,
  b_entails_a: false,
};
