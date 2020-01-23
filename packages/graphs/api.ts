// ID is for the node identifier.  should be string or number but not both
//
// N is for the node data. should probably be object, but still not sure
//
// E is for any metadata associated with an edge. ditto

export interface IGraphIterator<ID, N, E> {
  nodes(): IterableIterator<ID>;
  // name?
  nodes_with_data(): IterableIterator<readonly [ID, N]>;
  edges(): IterableIterator<readonly [ID, ID, E]>;
}

export interface IGraphReader<ID, N, E> extends IGraphIterator<ID, N, E> {
  has(id: ID): boolean;
  get_node(id: ID): N | undefined;
  get_edge(from: ID, to: ID): E | undefined;
}

export interface IAdjacencyListReader<ID, E> {
  // I hate to array-ize everything in cases where edge data is never needed
  edges_from(node: ID): IterableIterator<readonly [ID, E]>;
  // iterate both inbound and outbound edges touching node
  // what to call this? networkx has `all_neighbors`
  // not efficient for adjacency list.
  adjacent(node: ID): IterableIterator<readonly [ID, E]>;
}

// monotonic graph writer/builder
export interface IGraphConstructor<ID, N, E> {
  // should *not* update node.  return false if it already exists?
  add_node(id: ID, node: N): void;
  // ignore if non-strict... but currently no multigraph impl
  add_edge(from: ID, to: ID, data?: E): void;
}

// non-monotonic graph interface
export interface IGraphWriter<ID, N, E> extends IGraphConstructor<ID, N, E> {
  delete_node(id: ID): void;
  delete_edge(from: ID, to: ID): void;
  // set node value? set edge value?
}

// Fact-based interfaces for stream processing

// Make object optional & undefined for subjects so you can presence-test it.
// https://github.com/Microsoft/TypeScript/issues/12815
// https://github.com/Microsoft/TypeScript/issues/28138
export type GraphFact<ID, N, E> =
  | { subject: ID; object?: undefined; value?: N }
  | { subject: ID; object: ID; data?: E };

// But testing for the presence of `object` does not narrow the type as expected.
// https://github.com/microsoft/TypeScript/issues/31404
export const is_link = <ID, N, E>(
  x: GraphFact<ID, N, E>
): x is { subject: ID; object: ID; data?: E } => x.object != null;

export interface IGraphFacts<ID, N, E> {
  // This is same type as traversal would provide
  facts(): IterableIterator<GraphFact<ID, N, E>>;
}

export interface IMutableFactGraph<ID, N, E> {
  accept_fact(fact: GraphFact<ID, N, E>): void;
}

// Shorthand for common graph read interfaces
export type IGraphView<ID, N, E> = IGraphReader<ID, N, E> &
  IAdjacencyListReader<ID, E>;

export interface IGraph<ID, N, E>
  extends IGraphFacts<ID, N, E>,
    IMutableFactGraph<ID, N, E>,
    IGraphReader<ID, N, E>,
    IGraphWriter<ID, N, E>,
    IAdjacencyListReader<ID, E> {}
