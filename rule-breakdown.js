// see the stages in the application of rules
//////////////////////////////////// STEP 1: apply antecedent

const { q } = require("@def.codes/meld-core");
const { sync_query, RDFTripleStore } = require("@def.codes/rstream-query-rdf");

const examples = require("./lib/example-graph-pairs");
const { target } = examples["The author of Symposium is a student of Socrates"];

const antecedent = q("?s ?p ?o");
const store = new RDFTripleStore(target);
const result = sync_query(store, antecedent);

exports.display = {
  thing: store.triples,
};
