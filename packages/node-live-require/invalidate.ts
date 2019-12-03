// Functions for manipulating a Node require cache.
import { NodeRequireCache } from "./api";
import { transitive_dependents } from "./dependencies";

export const invalidate = (
  filename: string,
  cache: NodeRequireCache = require.cache
): void => {
  delete cache[filename];
};

// transitively invalidate a module in the require cache
// or “deep”?  same for deps functions
export const transitive_invalidate = (
  filename: string,
  cache: NodeRequireCache = require.cache
): void => {
  // The module id currently happens to be listed among its dependents, but
  // perhaps it should not.
  invalidate(filename, cache);

  const dependents = transitive_dependents(filename, cache);

  for (const dependent of dependents) invalidate(dependent, cache);
};
