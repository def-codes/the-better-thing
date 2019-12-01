export interface Traversal<K = any, N = any> {
  // Get the outbound edges from a given node, incuding “label” and target
  links(node: N): Iterable<[K, N]>;
}

// Boxing of primitive or reference values.
export interface Value {
  value: any;
}
export interface Reference {
  reference: number;
}
export type ValueOrReference = Value | Reference;

// Every item (except the root) will also have something indicating its
// relationship to its parent.
interface TraversalRootItem {
  value: any;
  index?: number;
}

export interface TraversalMemberNode extends TraversalRootItem {
  container: number;
  key: ValueOrReference;
  /** An actual runtime reference to the containing object. */
  parent: object;
}
export type TraversalNode = TraversalRootItem | TraversalMemberNode;

export interface TraversalState {
  indices: Map<object, number>;
  traversed: Set<object>;
}
