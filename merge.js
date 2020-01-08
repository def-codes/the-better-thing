// const { RDFTripleStore, factory } = require("@def.codes/rstream-query-rdf");
const cases = require("./lib/simple-merge-cases");
const { dot_notate } = require("./lib/dot-notate");
const { clusters_from } = require("./lib/clustering");

const [case_name, merge_case] = Object.entries(cases)[
  Object.entries(cases).length - 4
];

// merge the triples from graph b into graph a using simple entailment
const merge_graphs_simple = (a, b) => {};

const dot_statements = clusters_from({
  source: dot_notate(merge_case.source, "red").dot_statements,
  target: dot_notate(merge_case.target, "blue").dot_statements,
  merged: dot_notate(merge_case.merged, "purple").dot_statements,
}).map(_ => ({ ..._, attributes: { label: _.id.slice("cluster ".length) } }));

exports.display = {
  // thing: entail_case,
  dot_graph: { attributes: { label: case_name }, statements: dot_statements },
};
