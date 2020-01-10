// const { RDFTripleStore, factory } = require("@def.codes/rstream-query-rdf");
const cases = require("./lib/simple-merge-cases");
const { dot_notate } = require("./lib/dot-notate");
const { clusters_from } = require("./lib/clustering");

const [case_name, merge_case] = Object.entries(cases)[
  Object.entries(cases).length - 2
];

// merge the triples from graph b into graph a using simple entailment
const merge_graphs_simple = (a, b) => {
  // part 1: analyze incoming graph
  //   1a: collect subgraph comprising only the bnodes
  //   1b: separate bnodes into connected components
  //   1c: restore non-bnode triples to each bnode subgraph
  // part 2: determine existing entailment
  //   2a: for each resulting subgraph, attempt node mapping into target
  //   2b: if match, discard (asserting that substituted facts exist)
  //   2c: if no match, map new minted bnodes to existing ones
  // part 3: perform merge
  //   3a: (to view incoming) remove facts already in target
  //   3b: insert resulting facts into target
};

const dot_statements = clusters_from({
  source: dot_notate(merge_case.source, "red").dot_statements,
  target: dot_notate(merge_case.target, "blue").dot_statements,
  merged: dot_notate(merge_case.merged, "purple").dot_statements,
}).map(_ => ({ ..._, attributes: { label: _.id.slice("cluster ".length) } }));

exports.display = {
  // thing: entail_case,
  dot_graph: {
    directed: true,
    attributes: { label: case_name },
    statements: dot_statements,
  },
};
