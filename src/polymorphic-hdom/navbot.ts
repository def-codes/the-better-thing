// a thing to automate navigation through linked data.

// nav is the general “get moves”.  not every collection item is specially
// navigable.  but you can't know until you try.

// path steps are key-value pairs.

// dfs is a *path* traversal.  You need to keep track of visited nodes if you
// just want it to be a node traversal.

// requires datafy nav in project references, but this may not live here
import * as tx from "@thi.ng/transducers";
import { datafy, nav } from "@def.codes/datafy-nav";
import { depth_first_search } from "./depth-first-search";
import { as_key_values } from "./as-key-values";

export const navbot = function*(thing: unknown) {
  // BUT we never add to this.  How would we compare?
  const visited = new Set();
  let coll = datafy(thing);

  const with_self_keys = (coll: unknown) =>
    tx.map(([k, v]) => [coll, k, v] as const, as_key_values(coll));

  yield* depth_first_search<readonly [any, any, any]>(
    with_self_keys(coll),
    ([[coll, key, value]]) => {
      const naved = nav(coll, key, value);
      return with_self_keys(naved);

      // SHOULD skip when no navigation occured.  This depends on this
      // implementation guaranteeing that it doesn't mutate the value, e.g. by
      // adding metadata to it, which fs currently does.
      // return naved === value ? [] : with_self_keys(naved);
    },
    state => !visited.has(state) // but see above
  );
};
