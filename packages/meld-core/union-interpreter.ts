import type {
  IRDFTripleSource,
  IRDFTripleEvents,
} from "@def.codes/rstream-query-rdf";
import { UnionGraph, RDFTripleStore } from "@def.codes/rstream-query-rdf";
import type { MonotonicSystemOptions } from "./system";
import { monotonic_system } from "./system";

/**
 * Flow two graphs into an interpreter.  Feedback style by default.
 */
export const make_union_interpreter = (
  /** Input graph (the facts being interpreted). */
  given: IRDFTripleSource & IRDFTripleEvents,
  options: MonotonicSystemOptions & {
    // If a sink is provided, it must also be readable
    sink?: IRDFTripleSource & IRDFTripleEvents;
  }
) => {
  // the reservoir is “owned” by this thing, or can be provided from outside
  const reservoir = options.sink || new RDFTripleStore();
  const union = new UnionGraph(given, reservoir);
  const system = monotonic_system({
    source: union,
    sink: reservoir,
    ...(options || {}),
  });
  return { reservoir, union, system };
};
