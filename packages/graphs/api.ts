// ID is for the node identifier.  should be string or number but not both
//
// N is for the node data. should probably be object, but still not sure
//
// E is for any metadata associated with an edge. ditto

export interface IGraphIterator<ID, N, E> {
  nodes(): IterableIterator<ID>;
  // name?
  nodes_with_data(): IterableIterator<[ID, N]>;
  edges(): IterableIterator<[ID, ID, E]>;
}

export interface IGraphReader<ID, N, E> extends IGraphIterator<ID, N, E> {
  // has?
  get_node(id: ID): N | undefined;
  get_edge(from: ID, to: ID): E | undefined;
}

export interface IAdjacencyListReader<ID, E> {
  // I hate to array-ize everything in cases where edge data is never needed
  edges_from(node: ID): IterableIterator<[ID, E]>;
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

export type GraphFact<ID, N, E> =
  | { subject: ID; value?: N }
  | { subject: ID; object: ID; data?: E };

export interface IGraphFacts<ID, N, E> {
  // This is same type as traversal would provide
  facts(): IterableIterator<GraphFact<ID, N, E>>;
}

export interface IGraph<ID, N, E>
  extends IGraphFacts<ID, N, E>,
    IGraphReader<ID, N, E>,
    IGraphWriter<ID, N, E>,
    IAdjacencyListReader<ID, E> {}
