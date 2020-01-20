const tx = require("@thi.ng/transducers");
const { RDFTripleStore } = require("@def.codes/rstream-query-rdf");
const {
  triple_store_graph,
  connected_component_nodes,
} = require("@def.codes/graphs");
const { simple_entailment_mapping } = require("./graph-ops");

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
const islands_from = (input_triples, predicate) => {
  // collect subgraph comprising only the matching nodes
  const matching_triples = [...nodes_matching(input_triples, predicate)];

  // separate matching nodes into connected components
  const matching_store = new RDFTripleStore(matching_triples);
  const graph = triple_store_graph(matching_store);
  const components = connected_component_nodes(graph);

  // restore non-matching triples to each matching subgraph
  const islands = components.map(ids => [
    ...nodes_matching(input_triples, t => ids.has(t)),
  ]);

  return { matching_triples, components, islands };
};

module.exports = { islands_from };
