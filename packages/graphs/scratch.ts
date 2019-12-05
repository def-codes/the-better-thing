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

/////////////////////////////////////////j
// should support both value spaces in one graph?
// the distinction is out-of-band in most contexts
// i.e. you can't tell 1 from "1" by looking at the stringified output
// js also collapses these when used as object keys
// - that should be incidental
//   - but in practice would affect serialization of constructed graphs when
//     object is reduction target
// could support one *or* the other across a graph
// if I had to pick one it would be number, but string would be convenient

// node
interface Subject<T> {
  subject: T;
}
// edge
interface SubjectObject<T> extends Subject<T> {
  object: T;
}
// labeled edge
interface SubjectObjectPredicate<E, T> extends SubjectObject<T> {
  predicate: E;
}

// ah, also what if the object is a primitive

// But what about node data?
// I'd rather not assert node data and an edge at the same time
// why?

type GraphFact<E> = Subject | SubjectObject | SubjectObjectPredicate<E>;
////////////////////////////////////////////////////////////////////////

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
