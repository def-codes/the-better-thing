import * as Dot from "./api";
import * as tx from "@thi.ng/transducers";
import { IGraph, GraphFact, is_link } from "@def.codes/graphs";

// Cool but that's not what we're doing.  also, doesn't capture graph/subgraph
// type DotGraph = IGraph<string, Dot.NodeAttributes, Dot.EdgeAttributes>

// How to convert stuff
export interface NotationSpec<ID, N, E> {
  // Do we need the id's?  Maybe reverse these
  // provide access to graph generally?
  describe_node(id: ID, value: N): Dot.NodeAttributes | undefined;
  describe_edge(edge: readonly [ID, ID, E]): Dot.EdgeAttributes | undefined;
}

// See below... this could now be expressed in terms of below (though with
// additional indirection)
export function* statements_from_graph<ID extends string | number, N, E>(
  graph: IGraph<ID, N, E>,
  spec?: Partial<NotationSpec<ID, N, E>>
): IterableIterator<Dot.Statement> {
  const describe_node = spec?.describe_node;
  const describe_edge = spec?.describe_edge;

  for (const [id, value] of graph.nodes_with_data())
    yield {
      type: "node",
      id: id.toString(),
      ...(describe_node ? { attributes: describe_node(id, value) } : {}),
    };

  for (const edge of graph.edges())
    yield {
      type: "edge",
      from: edge[0].toString(),
      to: edge[1].toString(),
      ...(describe_edge ? { attributes: describe_edge(edge) } : {}),
    };
}

const to_dot_mapping = <ID, N, E>(
  spec?: Partial<NotationSpec<ID, N, E>>
): ((fact: GraphFact<ID, N, E>) => Dot.Statement) => {
  const node = spec?.describe_node;
  const edge = spec?.describe_edge;

  return the =>
    is_link(the)
      ? {
          type: "edge",
          from: the.subject.toString(),
          to: the.object.toString(),
          ...(edge
            ? { attributes: edge([the.subject, the.object, the.data]) }
            : {}),
        }
      : {
          type: "node",
          id: the.subject.toString(),
          ...(node ? { attributes: node(the.subject, the.value) } : {}),
        };
};

export const statements_from_traversal = <ID extends string | number, N, E>(
  items: Iterable<GraphFact<ID, N, E>>,
  spec?: Partial<NotationSpec<ID, N, E>>
): IterableIterator<Dot.Statement> => tx.map(to_dot_mapping(spec), items);
