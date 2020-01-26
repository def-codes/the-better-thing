const tx = require("@thi.ng/transducers");
const { RDFTripleStore } = require("@def.codes/rstream-query-rdf");
const {
  triple_store_graph,
  subgraph_view,
  connected_component_nodes,
} = require("@def.codes/graphs");

const node_matching = f => ([subject, , object]) => f(subject) || f(object);

const nodes_matching = (triples, predicate) =>
  tx.filter(node_matching(predicate), triples);

/**
 * Compute the subgraphs representing the “islands” of nodes matching a given
 * predicate, including all adjacent non-matches.
 *
 * Return value includes some intermediate results.
 *
 * Invariants:
 *
 * - every island is a subgraph of the input
 *
 * - every match from the input is on exactly one island
 *
 * - in each subgraph, every pair of matches is connected (ignoring direction)
 *
 * - in each subgraph, matches have all neighbors they had in original
 */
const islands_from = (input_triples, node_predicate) => {
  // create a store to index the triples
  const store = new RDFTripleStore(input_triples);

  // adapt store to graph
  const graph = triple_store_graph(store);

  // create a graph view comprising only the matching nodes
  const subgraph = subgraph_view(graph, { node_predicate });

  // separate matching nodes into connected components
  const components = connected_component_nodes(subgraph);

  // restore non-matching triples to each matching subgraph
  const islands = components.map(ids => [
    ...nodes_matching(input_triples, t => ids.has(t)),
  ]);

  return {
    intermediate: { store, graph, subgraph, components },
    output: islands,
  };
};

module.exports = { islands_from };
