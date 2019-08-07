/** Functional cache for single-arity functions.  `get` retrieves (and saves)
 * the value of `f(key)` for a given function `f`. */
export class MemoMap<K, V> implements Pick<Map<K, V>, "has" | "get"> {
  constructor(readonly base: Map<K, V>, readonly transform: (key: K) => V) {}

  has(key: K) {
    return this.base.has(key);
  }

  get(key: K) {
    if (this.base.has(key)) return this.base.get(key);
    const value = this.transform(key);
    this.base.set(key, value);
    return value;
  }
}
