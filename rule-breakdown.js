// see the stages in the application of rules
const { things_to_dot_statements } = require("./lib/thing-to-dot-statements");
const { dot_notate } = require("./lib/dot-notate");
const { clusters_from } = require("./lib/clustering");

//////////////////////////////////// STEP 1: apply antecedent

const { q } = require("@def.codes/meld-core");
const { sync_query, RDFTripleStore } = require("@def.codes/rstream-query-rdf");

const examples = require("./lib/example-graph-pairs");
/// const { target } = examples["The author of Symposium is a student of Socrates"];
const target = q(
  "Bob loves Alice",
  "Alice loves Carol",
  "_:xyz age 31",
  `_:xyz commonName "Fela"`,
  "?who loves me"
);

const antecedent = q("?s ?p ?o");
const source_store = new RDFTripleStore(target);
const result = sync_query(source_store, antecedent);

const dot_statements = clusters_from({
  source: dot_notate(source_store.triples).dot_statements,
  source_triples: things_to_dot_statements(source_store.triples).dot_statements,
  antecedent: dot_notate(antecedent).dot_statements,
  result: things_to_dot_statements(result || []).dot_statements,
}).map(_ => ({ ..._, attributes: { label: _.id.slice("cluster ".length) } }));

exports.display = { dot_statements };
