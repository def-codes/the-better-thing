import { IGraphView } from "./api";

interface SubgraphViewOptions<ID, N, E> {
  node_predicate(value: N, id: ID): boolean;
  edge_predicate(data: E, from: ID, to: ID): boolean;
}

const TRUE = () => true;

/**
 * Return a live, read-only view of a graph with node and edge filters applied.
 *
 * The returned graph is a subgraph of the given graph.  Nodes are included only
 * if they match the node predicate.  Edges are included only if they match the
 * edge predicate *and* both nodes match the node predicate.
 */
export const subgraph_view = <ID, N, E>(
  graph: IGraphView<ID, N, E>,
  options: Partial<SubgraphViewOptions<ID, N, E>>
): IGraphView<ID, N, E> => {
  const node_predicate = options.node_predicate || TRUE;
  const edge_predicate = options.edge_predicate || TRUE;

  const has = (id: ID): boolean =>
    graph.has(id) && node_predicate(graph.get_node(id), id);

  function* nodes_with_data() {
    for (const [id, value] of graph.nodes_with_data())
      if (node_predicate(value, id)) yield [id, value] as const;
  }

  return {
    has,
    nodes_with_data,

    get_node(id) {
      if (has(id)) return graph.get_node(id);
    },

    get_edge(from, to) {
      const data = graph.get_edge(from, to);
      if (has(from) && has(to) && edge_predicate(data, from, to)) return data;
    },

    *nodes() {
      for (const [id, value] of nodes_with_data()) yield id;
    },

    *edges() {
      for (const edge of graph.edges()) {
        const [from, to, data] = edge;
        if (has(from) && has(to) && edge_predicate(data, from, to)) yield edge;
      }
    },

    *edges_from(subject) {
      if (has(subject))
        for (const edge of graph.edges_from(subject)) {
          const [neighbor, data] = edge;
          if (has(neighbor) && edge_predicate(data, subject, neighbor))
            yield edge;
        }
    },

    *adjacent(node) {
      if (has(node))
        for (const edge of graph.adjacent(node)) {
          const [neighbor, data] = edge;
          if (has(neighbor) && edge_predicate(data, node, neighbor)) yield edge;
        }
    },
  };
};
