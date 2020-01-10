const tx = require("@thi.ng/transducers");
const { RDFTripleStore } = require("@def.codes/rstream-query-rdf");
const cases = require("./lib/simple-merge-cases");
const { bnodes_in, is_blank_node } = require("./lib/graph-ops");
const { dot_notate } = require("./lib/dot-notate");
const { clusters_from } = require("./lib/clustering");

const triples_with_blank_nodes = triples =>
  tx.filter(([s, , o]) => is_blank_node(s) || is_blank_node(o), triples);

// merge the triples from graph b into graph a using simple entailment
const merge_graphs_simple = (a, b) => {
  const triples_with_bnodes = [...triples_with_blank_nodes(b.triples)];
  // console.log(`with_bnodes`, with_bnodes);

  // now break this into clusters
  // const bnodes = [...bnodes_in(source_store)];
  // console.log(`bnodes`, bnodes);

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
  return { triples_with_bnodes };
};

function do_merge({ source, target, merged }) {
  const source_store = new RDFTripleStore(source);
  const target_store = new RDFTripleStore(target);
  return merge_graphs_simple(target_store, source_store);
}

const [case_name, merge_case] = Object.entries(cases)[
  Object.entries(cases).length - 1
];

const { triples_with_bnodes } = do_merge(merge_case);

const dot_statements = clusters_from({
  triples_with_bnodes: dot_notate(triples_with_bnodes, "gray").dot_statements,
  source: dot_notate(merge_case.source, "red").dot_statements,
  target: dot_notate(merge_case.target, "blue").dot_statements,
  merged: dot_notate(merge_case.merged, "purple").dot_statements,
}).map(_ => ({ ..._, attributes: { label: _.id.slice("cluster ".length) } }));

exports.display = {
  // thing: entail_case,
  dot_graph: {
    directed: true,
    attributes: {
      label: case_name,
      // rankdir: "LR",
      // layout: "circo",
    },
    statements: dot_statements,
  },
};
