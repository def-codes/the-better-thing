// given a context (from a define) make a require

import { amd_construct } from "./amd-construct";
import { AsyncMap } from "./AsyncMap";

interface FooContext {
  definitions: AsyncMap<string, object>;
}

export const make_require = (context: FooContext) => {
  // set up cache
  // require should have a cache of its own
  // it's called for by the spec (not to repeat factory call)
  // but can you extract that aspect?
  const modules = new AsyncMap();

  const require = async (needs, factory) => {
    // But can you make resolve without also passing *this function*?  Since all
    // it's going to do is require.  And the resolution of a thing, the
    // construction of a thing, should also mean the caching of that thing,
    // which needs to take effect later within the same evaluation.
    if (typeof needs === "string") return resolve(needs, context);

    const imports = await Promise.all(needs.map(require));

    return amd_construct({ needs, factory }, { imports });
  };

  return require;
};
