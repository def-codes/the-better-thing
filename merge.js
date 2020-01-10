const tx = require("@thi.ng/transducers");
const { RDFTripleStore, factory } = require("@def.codes/rstream-query-rdf");
const { map_object } = require("@def.codes/helpers");
const cases = require("./lib/simple-merge-cases");
const { bnodes_in, is_blank_node } = require("./lib/graph-ops");
const { dot_notate } = require("./lib/dot-notate");
const { clusters_from } = require("./lib/clustering");
const { color_connected_components } = require("./lib/color-connected");
const {
  triple_store_graph,
  connected_component_nodes,
} = require("@def.codes/graphs");

const triples_with_blank_nodes = triples =>
  tx.filter(([s, , o]) => is_blank_node(s) || is_blank_node(o), triples);

// merge the triples from graph b into graph a using simple entailment
const merge_graphs_simple = (a, b) => {
  // part 1: analyze incoming graph
  //   1a: collect subgraph comprising only the bnodes
  const triples_with_bnodes = [...triples_with_blank_nodes(b.triples)];

  //   1b: separate bnodes into connected components
  const bnodes_store = new RDFTripleStore(triples_with_bnodes);
  const graph = triple_store_graph(bnodes_store);
  const bnode_components = connected_component_nodes(graph);

  //   1c: restore non-bnode triples to each bnode subgraph
  // const restored_subgraphs = [tx.flatten(bnode_components.map(ids => ))];
  const bnode_islands = bnode_components.map(ids => {
    return b.triples.filter(([s, , o]) => ids.has(s) || ids.has(o));
  });
  // each subgraph must remain distinct

  // part 2: determine existing entailment
  //   2a: for each resulting subgraph, attempt node mapping into target
  //   2b: if match, discard (asserting that substituted facts exist)
  //   2c: if no match, map new minted bnodes to existing ones
  // part 3: perform merge
  //   3a: (to view incoming) remove facts already in target
  //   3b: insert resulting facts into target
  return {
    triples_with_bnodes,
    bnode_components,
    bnode_islands,
  };
};

function do_merge({ source, target, merged }) {
  const source_store = new RDFTripleStore(source);
  const target_store = new RDFTripleStore(target);
  return merge_graphs_simple(target_store, source_store);
}

const [case_name, merge_case] = Object.entries(cases)[
  Object.entries(cases).length - 1
];

const { triples_with_bnodes, bnode_components, bnode_islands } = do_merge(
  merge_case
);

const bnodes_store = new RDFTripleStore(triples_with_bnodes);
const components = dot_notate(triples_with_bnodes, "gray");
const color_notes = [...color_connected_components(bnode_components)];

const dot_statements = clusters_from({
  components: components.dot_statements,
  bnode_components: [...color_notes, ...components.dot_statements],
  bnode_islands: [
    ...clusters_from(
      Object.fromEntries(
        Object.entries(bnode_islands).map(([key, trips]) => [
          key,
          dot_notate(trips).dot_statements,
        ])
      )
    ),
  ],
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
