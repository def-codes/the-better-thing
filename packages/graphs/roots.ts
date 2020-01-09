import { IGraphIterator } from "./api";

/** O(N) function (on total edge count) for rinding roots in the given graph. */
export const roots = <ID>(
  graph: IGraphIterator<ID, any, any>
): ReadonlySet<ID> => {
  const candidates = new Set(graph.nodes());
  for (const [, object] of graph.edges()) candidates.delete(object);
  return candidates;
};
