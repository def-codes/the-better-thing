// import { IStack } from "@thi.ng/api";
// import { DCons } from "@thi.ng/dcons";

// yeah again you don't know that there aren't cycles
// and you can't constrain that structurally
// is this known as visitor?
//
// T is the type of items given as input
// O is the type of item iterated by the traversal (constructed?)
// A is the annotation type.  could be part of O
export interface RecursiveTraversalSpec<T, I, K extends PropertyKey, V> {
  intermediate(t: T): I;
  key(i: I): K;
  value(i: I): V;
  is_terminal(rec: Record<K, V[]>): boolean;
}

// Complementary traversal and construction
// We could actually require a constructable object
// but mostly we want to use plain data
// it's very easy to do linear traversal obviously
// and to flatten recursive traversals using iterators
// also you can use protocols
// so that the traversal supports "hands free" extension
// and you need to implement essential for object

interface Spec<N, S> {
  links_from(node: N): Iterable<N> | undefined;
  // huh?
  next_state(node: N): S;
}

// use a persistent list, a linked list or a dcons
interface IPersistentStack<S> /* extends IStack<N>*/ {
  push(value: S): IPersistentStack<S>;
}

// start with one item or many?  depth first starts with many
// no, if you recur like this, then it's depth first
// that's why a stack makes sense
export function* breadth_first<N, S>(
  items: Iterable<N>,
  spec: Spec<N, S>,
  state: IPersistentStack<S>
): IterableIterator<N> {
  for (const item of items) {
    // yield something;
    const linked = spec.links_from(item);
    const next_state = spec.next_state(item);
    if (linked) yield* breadth_first(linked, spec, state.push(next_state));
  }
}

// This approach materializes an object
// I think it's a dead end
const make_deep_object = <T, I, K extends PropertyKey, V>(
  items: Iterable<any>,
  spec: RecursiveTraversalSpec<T, I, K, V>
) => {
  const ret = {} as Record<K, V[]>;
  for (const item of items) {
    const mapped = spec.intermediate ? spec.intermediate(item) : item;
    const key = spec.key(mapped);
    const value = spec.value(mapped);
    (ret[key] || (ret[key] = [])).push(value);
  }
  const entries = Object.entries(ret) as [K, V[]][]; // TS: entries should know this though
  if (spec.is_terminal(ret))
    // prettier-ignore
    // @ts-ignore
    // prettier-ignore
    // @ts-ignore
    for (const [key, values] of entries)
  // prettier-ignore
      // @ts-ignore
      ret[key] = make_deep_object(values, spec);
  return ret;
};
