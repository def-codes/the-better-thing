import * as tx from "@thi.ng/transducers";
import { IGraphIterator, IAdjacencyListReader } from "./api";
import { TraversalSpec, traverse } from "./traverse";

// iterate the nodes of a graph with labels grouping them by maximally-connected
// components.
function* component_nodes<ID>(
  graph: IGraphIterator<ID, any, any> & IAdjacencyListReader<ID, any>
): IterableIterator<{ subject: ID; group: number }> {
  let group = -1;
  const seen = new Set();
  const spec: Partial<TraversalSpec<ID, any, any>> = {
    moves_from: id => graph.edges_from(id),
  };

  for (const node of graph.nodes()) {
    if (seen.has(node)) continue;
    group++;
    for (const { subject } of traverse<ID, any, any>([node], spec)) {
      if (!seen.has(subject)) {
        seen.add(subject);
        yield { subject, group };
      }
    }
  }
}

export const connected_component_nodes = <ID>(
  graph: IGraphIterator<ID, any, any> & IAdjacencyListReader<ID, any>
): readonly ReadonlySet<ID>[] => [
  ...tx
    .groupByMap(
      {
        key: _ => _.group,
        group: [() => new Set<ID>(), , (acc, val) => acc.add(val.subject)],
      },
      component_nodes(graph)
    )
    .values(),
];
