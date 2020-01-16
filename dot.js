/// rule-based Dot notation
const { DOT } = require("@def.codes/graphviz-format");
const { q, q1, q11 } = require("@def.codes/meld-core");
const { RDFTripleStore } = require("@def.codes/rstream-query-rdf");
const { interpret_rules } = require("./lib/rules");
const { dot_interpret_rdf_store } = require("./lib/dot-interpret-rdf-store");
const { dot_notate } = require("./lib/dot-notate");
const { clusters_from } = require("./lib/clustering");

const prep = (...cs) =>
  q(...cs.map(_ => _.replace(/dot:/g, DOT).replace(/ a /g, " rdf:type ")));

const DOT_SUBJECT_RULE = {
  name: "DotSubjectNodeRule",
  when: q("?s ?p ?o"),
  then: () => ({
    assert: prep(
      "_:sub a dot:Node",
      "_:sub def:represents ?s"
      // `?sub dot:color "green"` // TEMP debug
    ),
  }),
};

const DOT_OBJECT_RULE = {
  name: "DotObjectNodeRule",
  when: q("?s ?p ?o"),
  then: () => ({
    assert: prep(
      "_:obj a dot:Node",
      "_:obj def:represents ?o"
      // `?obj dot:color "orange"` // TEMP debug
    ),
  }),
};

const DOT_EDGE_RULE = {
  name: "DotEdgeRule",
  when: prep(
    "?subject ?predicate ?object",
    "?from a dot:Node",
    "?from def:represents ?subject",
    "?to a dot:Node",
    "?to def:represents ?object"
  ),
  then: () => ({
    assert: prep(
      "_:edge a dot:Edge",
      "_:edge dot:from ?from",
      "_:edge dot:to ?to",
      "_:edge def:represents _:trip",
      "_:trip rdf:subject ?subject",
      "_:trip rdf:predicate ?predicate",
      "_:trip rdf:object ?object"
    ),
  }),
};

const abc_triangle = q(
  "Alice spouseOf Bob",
  "Bob spouseOf Alice",
  "Carol loves Alice",
  "Bob loves Carol"
);

const input_triples = abc_triangle;
const input_store = new RDFTripleStore(input_triples);
const with_nodes = [
  ...interpret_rules(input_store, [DOT_SUBJECT_RULE, DOT_OBJECT_RULE]),
];
const with_nodes_store = new RDFTripleStore([...input_triples, ...with_nodes]);
const with_edges = [...interpret_rules(with_nodes_store, [DOT_EDGE_RULE])];
const with_edges_store = new RDFTripleStore([...with_nodes, ...with_edges]);

const interpreted = [
  ...dot_interpret_rdf_store(new RDFTripleStore(with_edges)),
];

const dot_statements = clusters_from({
  input: dot_notate(input_triples).dot_statements,
  interpreted,
  with_nodes: dot_notate(with_nodes_store.triples).dot_statements,
  with_edges: dot_notate(with_edges_store.triples).dot_statements,
}).map(_ => ({ ..._, attributes: { label: _.id.slice("cluster ".length) } }));

exports.display = {
  dot_graph: {
    directed: true,
    attributes: {
      // layout: "sfdp",
      splines: false,
      rankdir: "LR",
    },
    statements: dot_statements,
  },
};
