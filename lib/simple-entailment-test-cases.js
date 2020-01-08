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

exports["union merge on one bnode (sharing label!)"] = {
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

exports["WIP"] = {
  a: [
    [n("Socrates"), n("isa"), n("Athenian")],
    [n("Plato"), n("studentOf"), n("Socrates")],
    [n("Aristotle"), n("studentOf"), n("Plato")],
    [n("Plato"), n("authorOf"), n("Symposium")],
    [n("Socrates"), n("characterIn"), n("Symposium")],
  ],
  b: [
    [b("a"), n("studentOf"), b("b")],
    [b("c"), n("authorOf"), b("d")],
  ],
  a_entails_b: true,
  b_entails_a: false,
};

// trick must be that by their *own* properites, the matches for "a p _" all
// look valid.  But because of a cycle, another node that was looking at xx or
// yy invalidates one of the choices.
exports["multiple matches where one is invalid for nonlocal reason"] = {
  a: [
    [n("a"), n("p"), n("s")],
    [n("a"), n("p"), n("t")],
    [n("s"), n("p"), n("y")],
    [n("t"), n("p"), n("z")],
    [n("a"), n("p"), n("z")],
  ],
  b: [
    [b("aa"), n("p"), b("ss")],
    [b("ss"), n("p"), b("yy")],
    [b("aa"), n("p"), b("yy")],
  ],
  a_entails_b: true,
  b_entails_a: false,
};

exports["three conditionals"] = {
  a: [
    [n("a"), n("p"), n("c")],
    [n("b"), n("p"), n("c")],
    [n("c"), n("p"), n("d")],
    // [n("c"), n("p"), n("e")],
  ],
  b: [
    [b("aa"), n("p"), b("cc")],
    [b("bb"), n("p"), b("cc")],
    [b("cc"), n("p"), b("dd")],
    // [b("cc"), n("p"), b("ee")],
  ],
  a_entails_b: true,
  b_entails_a: false,
};

exports["multiple matches where one is invalid for *any* reason"] = {
  a: [
    [n("a"), n("p"), b("s")],
    [n("a"), n("q"), b("t")],
    [n("b"), n("p"), b("t")],
    [b("s"), n("p"), n("o")],
    // [b("t"), n("q"), n("o")],
  ],
  b: [
    [b("aa"), n("p"), b("ss")],
    [b("aa"), n("q"), b("tt")],
  ],
  /*
aa matches <a>
    if tt maps to _:t AND
       ss maps to _:s
ss matches _:s
    if aa maps to <a>
   matches _:t
    if aa maps to <b>
   matches <o>
    if aa maps to _:s
tt matches _:t
    if aa maps to <a>
*/
  a_entails_b: true,
  b_entails_a: false,
};

exports[
  "multiple matches where one is invalid for a reason not known *a priori*"
] = {
  a: [
    [n("a"), n("p"), b("s")],
    [n("a"), n("p"), b("t")],
    [b("t"), n("p"), n("o")],
  ],
  b: [
    [b("aa"), n("p"), b("ss")],
    [b("ss"), n("p"), b("rr")],
    [b("aa"), n("p"), b("rr")],
  ],
  /*
   */
  a_entails_b: true,
  b_entails_a: false,
};

// TODO: cases with literals
