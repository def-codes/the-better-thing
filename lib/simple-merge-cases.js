// maybe redundant with entailment tests
const { make_identity_factory } = require("@def.codes/rdf-data-model");
const factory = make_identity_factory();
const { namedNode: n, blankNode: b, literal: l } = factory;

const TYPE = n("rdf:type"); // faux CURIE

// GROUNDED GRAPHS

exports["empty graph (no-op)"] = {
  target: [
    [n("Socrates"), TYPE, n("Athenian")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
  ],
  source: [],
  merged: [
    [n("Socrates"), TYPE, n("Athenian")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
  ],
};

exports["subgraph (no-op)"] = {
  target: [
    [n("Socrates"), TYPE, n("Athenian")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
  ],
  source: [[n("Socrates"), TYPE, n("Athenian")]],
  merged: [
    [n("Socrates"), TYPE, n("Athenian")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
  ],
};

exports["equivalent graphs (no-op)"] = {
  target: [
    [n("Socrates"), TYPE, n("Athenian")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
  ],
  source: [
    [n("Socrates"), TYPE, n("Athenian")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
  ],
  merged: [
    [n("Socrates"), TYPE, n("Athenian")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
  ],
};

exports["supergraph: add one grounded triple"] = {
  target: [
    [n("Socrates"), TYPE, n("Athenian")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
  ],
  source: [
    [n("Socrates"), TYPE, n("Athenian")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
    [n("Socrates"), TYPE, n("Greek")],
  ],
  merged: [
    [n("Socrates"), TYPE, n("Athenian")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
    [n("Socrates"), TYPE, n("Greek")],
  ],
};

exports["disjunct graphs: add one grounded triple"] = {
  target: [
    [n("Socrates"), TYPE, n("Athenian")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
  ],
  source: [[n("Socrates"), TYPE, n("Greek")]],
  merged: [
    [n("Socrates"), TYPE, n("Athenian")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
    [n("Socrates"), TYPE, n("Greek")],
  ],
};

exports["supergraph: add two grounded triples"] = {
  target: [
    [n("Socrates"), TYPE, n("Athenian")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
  ],
  source: [
    [n("Socrates"), TYPE, n("Athenian")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
    [n("Socrates"), TYPE, n("Greek")],
    [n("Plato"), n("studentOf"), n("Socrates")],
  ],
  merged: [
    [n("Socrates"), TYPE, n("Athenian")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
    [n("Socrates"), TYPE, n("Greek")],
    [n("Plato"), n("studentOf"), n("Socrates")],
  ],
};

exports["overlapping graphs: add two grounded triples"] = {
  target: [
    [n("Socrates"), TYPE, n("Athenian")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
  ],
  source: [
    [n("Athenian"), n("subclassOf"), n("Greek")],
    [n("Socrates"), TYPE, n("Greek")],
    [n("Plato"), n("studentOf"), n("Socrates")],
  ],
  merged: [
    [n("Socrates"), TYPE, n("Athenian")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
    [n("Socrates"), TYPE, n("Greek")],
    [n("Plato"), n("studentOf"), n("Socrates")],
  ],
};

// BLANK NODES

exports["introduce one blank node not matching any existing node"] = {
  target: [
    [n("Socrates"), TYPE, n("Athenian")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
  ],
  source: [
    [n("Athenian"), n("subclassOf"), n("Greek")],
    [n("Socrates"), TYPE, n("Greek")],
    [b("x"), n("studentOf"), n("Socrates")],
  ],
  merged: [
    [n("Socrates"), TYPE, n("Athenian")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
    [n("Socrates"), TYPE, n("Greek")],
    [n("Plato"), n("studentOf"), n("Socrates")],
  ],
};

exports["one blank node matching an existing node (one triple)"] = {
  target: [
    [n("Socrates"), TYPE, n("Athenian")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
  ],
  source: [
    [b("x"), n("subclassOf"), n("Greek")],
    [n("Socrates"), TYPE, n("Greek")],
    [n("Plato"), n("studentOf"), n("Socrates")],
  ],
  merged: [
    [n("Socrates"), TYPE, n("Athenian")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
    [n("Socrates"), TYPE, n("Greek")],
    [n("Plato"), n("studentOf"), n("Socrates")],
  ],
};

exports["one blank node matching an existing node (one triple)"] = {
  target: [
    [n("Socrates"), TYPE, n("Athenian")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
  ],
  source: [
    [n("Athenian"), n("subclassOf"), n("Greek")],
    [b("x"), TYPE, n("Greek")],
    [n("Plato"), n("studentOf"), n("Socrates")],
  ],
  merged: [
    [n("Socrates"), TYPE, n("Athenian")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
    [n("Socrates"), TYPE, n("Greek")],
    [n("Plato"), n("studentOf"), n("Socrates")],
  ],
};

exports["one blank node matching an existing node (two triples)"] = {
  target: [
    [n("Socrates"), TYPE, n("Athenian")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
  ],
  source: [
    [n("Athenian"), n("subclassOf"), n("Greek")],
    [b("x"), TYPE, n("Greek")],
    [n("Plato"), n("studentOf"), b("x")],
  ],
  merged: [
    [n("Socrates"), TYPE, n("Athenian")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
    [n("Socrates"), TYPE, n("Greek")],
    [n("Plato"), n("studentOf"), n("Socrates")],
  ],
};

exports["one blank node matching an existing node (two disjoint triples)"] = {
  target: [
    [n("Socrates"), TYPE, n("Athenian")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
  ],
  source: [
    [n("Athenian"), n("subclassOf"), n("Greek")],
    [b("x"), TYPE, n("Greek")],
    [n("Plato"), n("studentOf"), b("y")],
  ],
  merged: [
    [n("Socrates"), TYPE, n("Athenian")],
    [n("Athenian"), n("subclassOf"), n("Greek")],
    [n("Socrates"), TYPE, n("Greek")],
    [n("Plato"), n("studentOf"), n("Socrates")],
  ],
};
