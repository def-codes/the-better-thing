const tx = require("@thi.ng/transducers");
const { RDFTripleStore } = require("@def.codes/rstream-query-rdf");
const {
  triple_store_graph,
  connected_component_nodes,
} = require("@def.codes/graphs");
const {
  bnodes_in,
  is_blank_node,
  simple_entailment_mapping,
} = require("./graph-ops");

const triples_with_blank_nodes = triples =>
  tx.filter(([s, , o]) => is_blank_node(s) || is_blank_node(o), triples);

// given a store, return (possibly overlapping) triple sets representing the
// “bnode islands”, including all bnode-adjacent terms.
//
// Return value includes some intermediate results.
//
// invariants:
//
// - no two subgraphs will share a bnode
//
// - in each subgraph, every pair of bnodes is connected (ignoring direction)
//
// - in each subgraph, bnodes have all neighbors they had in original
const merge_preprocess_source = store => {
  // collect subgraph comprising only the bnodes
  const triples_with_bnodes = [...triples_with_blank_nodes(store.triples)];

  // separate bnodes into connected components
  const bnodes_store = new RDFTripleStore(triples_with_bnodes);
  const graph = triple_store_graph(bnodes_store);
  const bnode_components = connected_component_nodes(graph);

  // restore non-bnode triples to each bnode subgraph
  const bnode_islands = bnode_components.map(ids =>
    store.triples.filter(([s, , o]) => ids.has(s) || ids.has(o))
  );

  return { triples_with_bnodes, bnode_components, bnode_islands };
};

// merge the triples from graph b into graph a using simple entailment
const merge_graphs_simple = (a, b) => {};

module.exports = { merge_preprocess_source, merge_graphs_simple };
