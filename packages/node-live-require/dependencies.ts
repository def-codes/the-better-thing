import * as tx from "@thi.ng/transducers";
import { depth_first_walk } from "@def.codes/graphviz-format";

// Node doesn't export this as such.  Was using this to do an instance check in
// below traversal, but it should only cover Module (aka NodeModule) instances.
//
// const Module = Object.getPrototypeOf(module).constructor;

const id = (_: NodeModule) => _.filename;

/** Get the id's of all modules downstream from the given module. */
export const transitive_dependencies = (
  filename: string,
  cache: Record<string, NodeModule> = require.cache
): Set<string> =>
  tx.transduce(
    tx.map(_ => _.value.filename),
    tx.conj(),
    depth_first_walk([cache[filename]], {
      spec: { id, links_from: _ => _.children.map((x, i) => [i, x]) },
    })
  );
