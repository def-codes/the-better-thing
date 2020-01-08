// const { RDFTripleStore, factory } = require("@def.codes/rstream-query-rdf");
const entail_cases = require("./lib/simple-entailment-test-cases");
const { dot_notate } = require("./lib/dot-notate");

const [, entail_case] = Object.entries(entail_cases)[14];

const { dot_statements } = dot_notate(entail_case.a);

exports.display = {
  // thing: entail_case,
  dot_statements,
};
