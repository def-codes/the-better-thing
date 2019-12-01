// Is this just a special case of coroutines?  What would such interfaces look
// like?

// where T is the type of thing and L is the type of link (edge label)
export interface LabeledSyncTraversalSpec<T = any, I = T, L = any> {
  /** Get a unique identifier for this thing.  Default is built-in equality. */
  id(thing: T): I;

  /** Get the outbound edges from a given node, incuding “label” and target. */
  // Would this take thing or ID?
  links_from(thing: T): Iterable<[L, T]>;
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
interface TraversalRootItem<T = any> {
  value: T;
  index?: number;
}

export interface TraversalMemberNode<T = any> extends TraversalRootItem<T> {
  container: number;
  key: ValueOrReference;
  /** An actual runtime reference to the containing object. */
  parent: object;
}
export type TraversalNode<T = any> =
  | TraversalRootItem<T>
  | TraversalMemberNode<T>;

// Indexed
// Support resumable traversals.
// where I is the type of item ID
export interface TraversalState<I extends object = object> {
  indices: Map<I, number>;
  traversed: Set<I>;
}

export interface TraversalOptions<T = any, I = T, L = any> {
  spec: LabeledSyncTraversalSpec<T, I, L>;
  state: TraversalState;
}
