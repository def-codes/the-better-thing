/** Functional cache for single-arity functions.  `get` retrieves (and saves)
 * the value of `f(key)` for a given function `f`. */
export const memo_map = <K, V>(
  base: Map<K, V>,
  transform: (key: K) => V
): ReadonlyMap<K, V> =>
  Object.create(base, {
    get: {
      value(key: K): V {
        if (base.has(key)) return base.get(key);
        const value = transform(key);
        base.set(key, value);
        return value;
      },
    },
  });
