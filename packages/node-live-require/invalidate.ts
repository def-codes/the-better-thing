// Functions for manipulating a Node require cache.
//
/*

  Note that while it's okay to use the locally-available version of
  require.cache, it's *not* okay to use the local require.resolve, since it
  depends on the original path to which its `require` was bound.  In other
  words:

> const other = require('module').createRequire(process.cwd()))
undefined
> require === other
false
> require.cache === other.cache
true
> require.resolve === other.resolve
false

   Although these functions operate on the cache, they allow the caller to
   specify modules by id rather than full path.  As a result, the caller's
   require is needed in order to resolve the module id.

*/
import { transitive_dependents } from "./dependencies";

// transitively invalidate a module in the require cache
// directly mutates the cache
export const invalidate = (module_id: string, require: NodeRequire): void => {
  const filename = require.resolve(module_id);
  delete require.cache[filename];
};

// or “deep”?  same for deps functions
export const transitive_invalidate = (
  module_id: string,
  require: NodeRequire
): void => {
  // The module id currently happens to be listed among its dependents, but
  // perhaps it should not.
  invalidate(module_id, require);

  const dependents = transitive_dependents(
    require.resolve(module_id),
    require.cache
  );

  for (const dependent of dependents) invalidate(dependent, require);
};
