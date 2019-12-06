// kind of temp.  this is essentially a reducer since it needs init step
// doing it this way first
import { GraphFact, IGraph } from "./api";
import { Graph } from "./graph";

export const from_facts = <ID, N, E>(
  facts: Iterable<GraphFact<ID, N, E>>
): IGraph<ID, N, E> => {
  const graph = new Graph();

  for (const fact of facts) graph.accept_fact(fact);
  // @ts-ignore: TS2322: Type 'Graph<unknown, unknown, unknown>' is not assignable to type 'IGraph<ID, N, E>'.
  return graph;
};
