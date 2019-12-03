import { NodeRequireCache } from "./api";
import * as tx from "@thi.ng/transducers";
import { depth_first_walk } from "@def.codes/graphviz-format";

// Was using this to do an instance check in below traversal, but it should only
// cover Module (aka NodeModule) instances.
// const { Module } = require("module");

const id = (_: NodeModule) => _.filename;

/** Get the id's of all modules downstream from the given module. */
export const transitive_dependencies = (
  filename: string,
  cache: NodeRequireCache = require.cache
): Set<string> =>
  tx.transduce(
    tx.map(_ => _.value.filename),
    tx.conj(),
    // A module isn't dependent on itself, so use the first set as roots.
    depth_first_walk(cache[filename] ? cache[filename].children : [], {
      spec: { id, links_from: _ => _.children.map((x, i) => [i, x]) },
    })
  );

// support upstream traversal
export const reverse_index = (cache: NodeRequireCache) => {
  const index: Record<string, string[]> = {};
  for (const [name, mod] of Object.entries(cache))
    for (const child of mod.children)
      (index[child.filename] || (index[child.filename] = [])).push(name);
  return index;
};

/** Get the id's of all modules downstream from the given module. */
export const transitive_dependents = (
  filename: string,
  cache: NodeRequireCache = require.cache
): Set<string> => {
  const index = reverse_index(cache);

  return tx.transduce(
    tx.map(_ => _.value.filename),
    tx.conj(),
    // node could in theory be just a string, but walker (currently) only
    // attempts traversal on objects.
    depth_first_walk<Pick<NodeModule, "filename">, string, any>(
      // A module isn't dependent on itself, so use the first set as roots.
      (index[filename] || []).map(_ => ({ filename: _ })),
      {
        spec: {
          id,
          links_from: _ =>
            (index[_.filename] || []).map((filename, i) => [i, { filename }]),
        },
      }
    )
  );
};
