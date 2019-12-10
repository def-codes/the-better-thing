import { IGraph } from "./api";

// WIP. this is screwy
// it's caller's job to pick one from outbound edges
// keeps this from introducing its own non-determinism
// should include start node? it might not exist
export function* follow_path<ID, E>(
  graph: IGraph<ID, any, E>,
  start: ID,
  predicates: Iterable<(outbound: Iterable<[ID, E]>) => ID | undefined>
): IterableIterator<[ID, E]> {
  let next: ID,
    previous = start;
  for (const predicate of predicates) {
    next = predicate(graph.edges_from(previous));
    if (!next) break;
    yield [next, graph.get_edge(previous, next)];
    previous = next;
  }
}

// make predicate that accepts first match
export const step = <ID, E>(
  predicate: (data: E) => boolean
): ((outbound: Iterable<[ID, E]>) => ID | undefined) => edges => {
  for (const [id, data] of edges) if (predicate(data)) return id;
};
