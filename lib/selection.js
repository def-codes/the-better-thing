/*
Selection is an operation that can be performed against a graph G.

Its result is a subgraph of G.

Selection against:
- a graph
- a traversal

Selection of:
- individual nodes
- individual edges
- many nodes
- many edges
- sugraph

- path (predicate vector)
- everything reachable
- everything matching a predicate

What is common to selections?
- start node(s)
- 

*/
const tx = require("@thi.ng/transducers");
const { traverse } = require("@def.codes/graphs");

// move to package
const traversal_spec_from_graph = graph => ({
  value_of: id => graph.get_node(id),
  moves_from: id => graph.edges_from(id),
});

// against traversal, select nodes (not edges) with value matching predicate
const select_matching_value = (facts, predicate) =>
  tx.filter(_ => _.object == null && predicate(_.value), facts);

// based on facts; could also use graph directly
const outbound_edges_from_all = (facts, ids) =>
  tx.filter(_ => _.object != null && ids.includes(_.subject), facts);

//
const facts_reachable_from = (graph, ids) =>
  traverse(ids, traversal_spec_from_graph(graph));

const ids_reachable_from = (graph, n) =>
  tx.map(_ => _.subject, traverse([n], traversal_spec_from_graph(graph)));

const select_ids_matching_value = (facts, predicate) =>
  tx.map(_ => _.subject, select_matching_value(facts, predicate));

module.exports = {
  select_matching_value,
  facts_reachable_from,
  ids_reachable_from,
  select_ids_matching_value,
  outbound_edges_from_all,
};
