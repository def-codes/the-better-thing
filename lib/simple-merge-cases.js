// maybe redundant with entailment tests
const { make_identity_factory } = require("@def.codes/rdf-data-model");
const factory = make_identity_factory();
const { namedNode: n, blankNode: b, literal: l } = factory;
const { q } = require("@def.codes/meld-core");

// GROUNDED GRAPHS

const EXAMPLE_GROUND = q(
  "Alexander a Emperor", // or something to distinguish from PtolemyI
  "Alexander a Person",
  "Alexander kingOf Macedon",
  "Aristotle a Person",
  "Aristotle a Person",
  "Aristotle studentOf Plato",
  "Aristotle tutorOf Alexander",
  "Aristotle tutorOf PtolemyI",
  "Athens a City",
  "Athens partOf Greece",
  "City kindOf Place",
  "Country kindOf Place",
  "Greece a Country",
  "Plato a Person",
  "Plato authorOf Symposium",
  "Plato bornIn Athens",
  "Plato studentOf Socrates",
  "PtolemyI a Person",
  "PtolemyI kingOf Macedon",
  "Socrates a Person",
  "Socrates bornIn Athens",
  "Socrates characterIn Symposium",
  "Symposium a Book"
);

exports["empty graph (no-op)"] = {
  target: q("Socrates a Athenian", "Athenian subclassOf Greek"),
  source: q(),
  merged: q("Socrates a Athenian", "Athenian subclassOf Greek"),
};

exports["subgraph (no-op)"] = {
  target: q("Socrates a Athenian", "Athenian subclassOf Greek"),
  source: q("Socrates a Athenian"),
  merged: q("Socrates a Athenian", "Athenian subclassOf Greek"),
};

exports["equivalent graphs (no-op)"] = {
  target: q("Socrates a Athenian", "Athenian subclassOf Greek"),
  source: q("Socrates a Athenian", "Athenian subclassOf Greek"),
  merged: q("Socrates a Athenian", "Athenian subclassOf Greek"),
};

exports["supergraph: add one grounded triple"] = {
  target: q("Socrates a Athenian", "Athenian subclassOf Greek"),
  source: q(
    "Socrates a Athenian",
    "Athenian subclassOf Greek",
    "Socrates a Greek"
  ),
  merged: q(
    "Socrates a Athenian",
    "Athenian subclassOf Greek",
    "Socrates a Greek"
  ),
};

exports["disjunct graphs: add one grounded triple"] = {
  target: q("Socrates a Athenian", "Athenian subclassOf Greek"),
  source: q("Socrates a Greek"),
  merged: q(
    "Socrates a Athenian",
    "Athenian subclassOf Greek",
    "Socrates a Greek"
  ),
};

exports["supergraph: add two grounded triples"] = {
  target: q("Socrates a Athenian", "Athenian subclassOf Greek"),
  source: q(
    "Socrates a Athenian",
    "Athenian subclassOf Greek",
    "Socrates a Greek",
    "Plato studentOf Socrates"
  ),
  merged: q(
    "Socrates a Athenian",
    "Athenian subclassOf Greek",
    "Socrates a Greek",
    "Plato studentOf Socrates"
  ),
};

exports["overlapping graphs: add two grounded triples"] = {
  target: q("Socrates a Athenian", "Athenian subclassOf Greek"),
  source: q(
    "Athenian subclassOf Greek",
    "Socrates a Greek",
    "Plato studentOf Socrates"
  ),
  merged: q(
    "Socrates a Athenian",
    "Athenian subclassOf Greek",
    "Socrates a Greek",
    "Plato studentOf Socrates"
  ),
};

// BLANK NODES

exports["introduce one blank node not matching any existing node"] = {
  target: q("Socrates a Athenian", "Athenian subclassOf Greek"),
  source: q(
    "Athenian subclassOf Greek",
    "Socrates a Greek",
    "_:x studentOf Socrates"
  ),
  merged: q(
    "Socrates a Athenian",
    "Athenian subclassOf Greek",
    "Socrates a Greek",
    "Plato studentOf Socrates"
  ),
};

exports["one blank node matching an existing node (one triple)"] = {
  target: q("Socrates a Athenian", "Athenian subclassOf Greek"),
  source: q(
    "_:x subclassOf Greek",
    "Socrates a Greek",
    "Plato studentOf Socrates"
  ),
  merged: q(
    "Socrates a Athenian",
    "Athenian subclassOf Greek",
    "Socrates a Greek",
    "Plato studentOf Socrates"
  ),
};

exports["one blank node matching an existing node (one triple)"] = {
  target: q("Socrates a Athenian", "Athenian subclassOf Greek"),
  source: q(
    "Athenian subclassOf Greek",
    "_:x a Greek",
    "Plato studentOf Socrates"
  ),
  merged: q(
    "Socrates a Athenian",
    "Athenian subclassOf Greek",
    "Socrates a Greek",
    "Plato studentOf Socrates"
  ),
};

exports["one blank node matching an existing node (two triples)"] = {
  target: q("Socrates a Athenian", "Athenian subclassOf Greek"),
  source: q("Athenian subclassOf Greek", "_:x a Greek", "Plato studentOf _:x"),
  merged: q(
    "Socrates a Athenian",
    "Athenian subclassOf Greek",
    "Socrates a Greek",
    "Plato studentOf Socrates"
  ),
};

exports["one blank node matching an existing node (two disjoint triples)"] = {
  target: q("Socrates a Athenian", "Athenian subclassOf Greek"),
  source: q("Athenian subclassOf Greek", "_:x a Greek", "Plato studentOf _:y"),
  merged: q(
    "Socrates a Athenian",
    "Athenian subclassOf Greek",
    "Socrates a Greek",
    "Plato studentOf Socrates"
  ),
};

exports[
  "pre-existing bnodes remain such even when an incoming fact matches"
] = {
  target: q("_:z studentOf Socrates"),
  source: q("Plato studentOf Socrates"),
  // the resulting graph is not lean, but that's not the merge's business
  // ......RIGHT?
  merged: q("_:z studentOf Socrates", "Plato studentOf Socrates"),
};

exports["The author of Symposium is a student of Socrates"] = {
  source: q("_:pl authorOf Symposium", "_:pl studentOf Socrates"),
  target: q(),
  merged: q(),
};

exports["Aristotle is a student of the author of Symposium"] = {
  source: q("_:as authorOf Symposium", "Aristotle studentOf _:as"),
  target: q(),
  merged: q(),
};

exports["Aristotle is the author of a book"] = {
  source: q("Aristotle authorOf _:ab", "_:ab a Book"),
  target: q(),
  merged: q(),
};

exports[
  "The tutor of Alexander was a student of the author of the Symposium"
] = {
  source: q(
    "_:ar tutorOf Alexander",
    "_:ar studentOf pl",
    "_:pl authorOf Symposium"
  ),
  target: q(),
  merged: q(),
};

exports["Plato is the author of some book in which Socrates is a character"] = {
  source: q("Plato authorOf _:sy", "Socrates characterIn _:sy", "_:sy a Book"),
  target: q(),
  merged: q(),
};

exports["There is a thing of which PtolemyI and Alexander both were king"] = {
  source: q("Alexander kingOf _:ma", "PtolemyI kingOf _:ma"),
  target: q(),
  merged: q(),
};

// Note, this does not say two, because we don't know enough to tell whether
// these are distinct.  We could use sameAs to assert that they are the same.
// We could achieve the same by using the same label in the first place, but
// it's not always possible to modify the graph.
//
// Could we assert that they are disjoint?  I don't know a way to do that
// directly, but what if you asserted an additional fact about one and not the
// other?
exports["Aristotle was tutor to at least one king of Macedon"] = {
  source: q(
    "Aristotle tutorOf _:x",
    "Aristotle tutorOf _:y",
    "_:x kingOf Macedon",
    "_:y kingOf Macedon"
  ),
  target: q(),
  merged: q(),
};

exports[
  "Aristotle was tutor to at least one king of Macedon, one of which was an Emperor"
] = {
  source: q(
    "Aristotle tutorOf _:x",
    "Aristotle tutorOf _:y",
    "_:x kingOf Macedon",
    "_:y kingOf Macedon",
    "_:y a Emperor"
  ),
  target: q(),
  merged: q(),
};

// Is there a use for this kind of “fact”?
exports["someone was a student of someone"] = {
  source: q("_:a studentOf _:y"),
  target: q(),
  merged: q(),
};

// This is not a grounded fact but could lead to the creation of grounded facts
// via inference (e.g. using the domain of the property.)
exports["Aristotle was a student of someone or something"] = {
  source: q("Aristotle studentOf _:pl"),
  target: q(),
  merged: q(),
};

// Note we don't say *someone else*.  This doesn't necessarily mean that the two
// are different.  You can be a student of yourself.  This could be satisfied by
// such a node.
exports["Aristotle was a student of a student of someone or something"] = {
  source: q("Aristotle studentOf _:pl", "_:pl studentOf _:so"),
  target: q(),
  merged: q(),
};

exports[
  "Aristotle was a student of a student of someone who was born in some place"
] = {
  source: q(
    "Aristotle studentOf _:pl",
    "_:pl studentOf _:so",
    "_:so bornIn _:ath"
  ),
  target: q(),
  merged: q(),
};

exports[
  "Aristotle was a student of a student of someone who was born in a part of Greece"
] = {
  source: q(
    "Aristotle studentOf _:pl",
    "_:pl studentOf _:so",
    "_:so bornIn _:ath",
    "_:ath partOf Greece"
  ),
  target: q(),
  merged: q(),
};

exports[
  "Aristotle was a student of a student of someone who was born in a part of Greece AND who was a character in a book"
] = {
  source: q(
    "Aristotle studentOf _:pl",
    "_:pl studentOf _:so",
    "_:so bornIn _:ath",
    "_:ath partOf Greece",
    "_:so characterIn _:sy",
    "_:sy a Book"
  ),
  target: q(),
  merged: q(),
};

exports[
  "Aristotle was a student of a student of someone who was born in a part of Greece AND who was a character in a book written by that student."
] = {
  source: q(
    "Aristotle studentOf _:pl",
    "_:ath partOf Greece",
    "_:pl authorOf _:sy",
    "_:pl studentOf _:so",
    "_:so bornIn _:ath",
    "_:so characterIn _:sy",
    "_:sy a Book"
  ),
  target: q(),
  merged: q(),
};

exports["bnodes with disconnected components"] = {
  target: EXAMPLE_GROUND, // q("Socrates a Athenian", "Athenian subclassOf Greek"),
  source: q(
    // grounded facts
    "Athens partOf Greece",
    "Socrates characterIn Symposium",

    // Athens is an instance of some kind of place
    "Athens a City",
    "Athens a _:ci",
    "_:ci kindOf Place",

    // Aristotle was a student of someone who authored a book with a character
    // from a part of Greece, and who was a also a student of that person.
    "Aristotle studentOf _:pl",
    "_:ath partOf Greece",
    "_:pl authorOf _:sy",
    "_:pl studentOf _:so",
    "_:so bornIn _:ath",
    "_:so characterIn _:sy",
    "_:sy a Book",

    // There is a thing of which PtolemyI and Alexander both were king
    "Alexander kingOf _:ma",
    "PtolemyI kingOf _:ma"
  ),
  merged: EXAMPLE_GROUND,
};
