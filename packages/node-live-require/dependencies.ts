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
    depth_first_walk([cache[filename]], {
      spec: { id, links_from: _ => _.children.map((x, i) => [i, x]) },
    })
  );

/** Get the id's of all modules downstream from the given module. */
export const transitive_dependents = (
  filename: string,
  cache: NodeRequireCache = require.cache
): Set<string> => {
  // reverse index for traversal
  const index: Record<string, string[]> = {};
  for (const [name, mod] of Object.entries(cache))
    for (const child of mod.children)
      (index[child.filename] || (index[child.filename] = [])).push(name);

  return tx.transduce(
    tx.map(_ => _.value.filename),
    tx.conj(),
    // node could in theory be just a string, but walker (currently) only
    // attempts traversal on objects.
    depth_first_walk<Pick<NodeModule, "filename">, string, any>(
      [{ filename }],
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
