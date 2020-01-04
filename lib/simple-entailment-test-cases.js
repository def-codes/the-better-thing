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

// using short predicate names to make graph notation more legible
exports["two reified statements with one shared term"] = {
  a: [
    [b("w"), n("s"), n("Socrates")],
    [b("w"), n("p"), TYPE],
    [b("w"), n("o"), n("Athenian")],
    [b("x"), n("s"), n("Athenian")],
    [b("x"), n("p"), n("subclassOf")],
    [b("x"), n("o"), n("Greek")],
  ],
  b: [
    [b("y"), n("s"), n("Socrates")],
    [b("y"), n("p"), TYPE],
    [b("y"), n("o"), n("Athenian")],
    [b("z"), n("s"), n("Athenian")],
    [b("z"), n("p"), n("subclassOf")],
    [b("z"), n("o"), n("Greek")],
  ],
  a_entails_b: true,
  b_entails_a: true,
};

exports["two reified statements with one shared bnode"] = {
  a: [
    [b("w"), n("s"), n("Socrates")],
    [b("w"), n("p"), TYPE],
    [b("w"), n("o"), b("a")],
    [b("x"), n("s"), b("a")],
    [b("x"), n("p"), n("subclassOf")],
    [b("x"), n("o"), n("Greek")],
  ],
  b: [
    [b("y"), n("s"), n("Socrates")],
    [b("y"), n("p"), TYPE],
    [b("y"), n("o"), b("b")],
    [b("z"), n("s"), b("b")],
    [b("z"), n("p"), n("subclassOf")],
    [b("z"), n("o"), n("Greek")],
  ],
  a_entails_b: true,
  b_entails_a: true,
};

exports["two reified statements with multiple bnodes"] = {
  a: [
    [b("w"), n("s"), n("Socrates")],
    [b("w"), n("p"), b("a")],
    [b("w"), n("o"), b("b")],
    [b("x"), n("s"), b("b")],
    [b("x"), n("p"), n("subclassOf")],
    [b("x"), n("o"), n("Greek")],
  ],
  b: [
    [b("y"), n("s"), n("Socrates")],
    [b("y"), n("p"), b("c")],
    [b("y"), n("o"), b("d")],
    [b("z"), n("s"), b("d")],
    [b("z"), n("p"), n("subclassOf")],
    [b("z"), n("o"), n("Greek")],
  ],
  a_entails_b: true,
  b_entails_a: true,
};

exports["two reified statements shared versus split bnodes"] = {
  a: [
    [b("w"), n("s"), n("Socrates")],
    [b("w"), n("p"), b("a")],
    [b("w"), n("o"), b("b")],
    [b("x"), n("s"), b("b")],
    [b("x"), n("p"), n("subclassOf")],
    [b("x"), n("o"), n("Greek")],
  ],
  b: [
    [b("y"), n("s"), n("Socrates")],
    [b("y"), n("p"), b("c")],
    [b("y"), n("o"), b("d")],
    [b("z"), n("s"), b("e")],
    [b("z"), n("p"), n("subclassOf")],
    [b("z"), n("o"), n("Greek")],
  ],
  a_entails_b: true,
  b_entails_a: false,
};
