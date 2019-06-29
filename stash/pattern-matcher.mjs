// This is no longer used here and probably should be scrapped.

/**
 * A crude utility for mapping from defined patterns to recognized structures.
 * Proxy is used here to trap destructuring attempts by the runtime in order to
 * leverage function signatures as both matching predicates and destructuring
 * sites.
 */

const pattern_proxy = target =>
  new Proxy(target, {
    get(target, key) {
      // could trap Symbol.iterator here for finer array handling
      if (typeof key === "symbol" || key in target) {
        const value = target[key];
        return value !== null && typeof value === "object"
          ? pattern_proxy(value)
          : value;
      }
      throw Error(`No such key ‘${key.toString()}’`);
    }
  });

export const match = (patterns, input) => {
  const proxy = pattern_proxy(input);
  for (const pattern of patterns)
    try {
      if (pattern(proxy)) return pattern(input);
    } catch (e) {}
};
