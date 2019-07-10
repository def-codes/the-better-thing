// a thing to automate navigation through linked data.

// nav is the general “get moves”.  not every collection item is specially
// navigable.  but you can't know until you try.

// path steps are key-value pairs.

// dfs is a *path* traversal.  You need to keep track of visited nodes if you
// just want it to be a node traversal.

// requires datafy nav in project references, but this may not live here
import { datafy, nav } from "@def.codes/datafy-nav";
import { depth_first_search } from "./depth-first-search";
import { as_key_values } from "./as-key-values";

export const navbot = function*(thing: unknown) {
  // where do you set this?  also would this be on reference identity?
  // const visited = new Set();
  let coll = datafy(thing);

  const dfs = depth_first_search<[any, any]>(
    as_key_values(coll),
    ([last]) => last && as_key_values(last),
    ([last]) => last && typeof last === "object" // consider all objects to be collections
  );

  for (const path of dfs) {
    const [last] = path;
    const [key, value] = last;
    const next = nav(coll, key, value);
    const moved = coll !== next;
    coll = next;

    if (moved) yield { path, coll, key, value };
    else yield { still: key };
  }
};
