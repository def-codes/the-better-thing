//////////////////////////////////
export type JSON =
  | null
  | boolean
  | number
  | string
  | JSON[]
  | { [key: string]: JSON };

// Provisional
// export type PortableGraphFact<N extends JSON, E extends JSON> =
//   | GraphFact<string, N, E>
//   | GraphFact<number, N, E>;
////////////////////////

// GOAL: support “pouring” between graphs
// i.e. pipe a traversal into a constructor
// need essentially a reducer that produces a graph
// and (special?) transducers that support useful graph transforms against traversal streams

// is `null` really a primitive?
type JSONPrimitive = null | boolean | number | string;

type Primitive = JSONPrimitive | symbol | bigint;

// A composite that contains no composites.
// This is useful to ensure that traversals terminate.
// or ValueObject?
type LeafObject = Record<string, Primitive>;

// Note this doesn't include functions, which are objects and can have own properties
// so they are treated like other objects
interface TraversalIteratorItem extends Readonly<LeafObject> {}

export interface ITraversal<Item> extends IterableIterator<Item> {
  // ?
}

// I mean pretty much all traversals will be stateful
export interface IStatefulTraversal<State, Item> extends ITraversal<Item> {
  readonly state: State;
}

export interface IAdjacencyList<T> {
  neighbors(): Iterable<T>;
}

export interface IAdjacencyMap<K, V>
  extends IAdjacencyList<IAdjacencyMap<K, V>> {
  // deref, valueOf, etc
  value(): V;
  links(): ReadonlyMap<K, IAdjacencyMap<K, V>>;
}

// This could describe a trie, e.g.
type PrefixTree = IAdjacencyMap<string, { count: number }>;
