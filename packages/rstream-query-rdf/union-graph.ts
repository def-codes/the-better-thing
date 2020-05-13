import { EquivMap, ArraySet } from "@thi.ng/associative";
import { Stream, sync } from "@thi.ng/rstream";
import * as tx from "@thi.ng/transducers";
import type { QuerySpec, QuerySolution, Solution } from "@thi.ng/rstream-query";
import { IRDFTripleSource } from "./api";

// ASSUMES that solutions have the same keys
// ASSUMES that solution values can use equality comparison
const solution_equals = (a: Solution, b: Solution) =>
  Object.keys(a).every(k => a[k] === b[k]);

// ArraySet by itself works, but this is optimized for assumptions
const OPTS = { equiv: solution_equals };

/**
 * EXPERIMENTAL: a graph that is part read-only (given) and part writable.  The
 * graph appears as the union of the two parts.
 */
export class UnionGraph implements IRDFTripleSource {
  constructor(readonly _a: IRDFTripleSource, readonly _b: IRDFTripleSource) {}
  private _queries = new EquivMap<QuerySpec, Stream<QuerySolution>>();

  subjects() {
    return new Set(tx.concat(this._a.subjects(), this._b.subjects()));
  }

  get triples() {
    // technically should dedupe
    return tx.concat(this._a.triples, this._b.triples);
  }

  addQueryFromSpec(spec: QuerySpec): QuerySolution {
    // Maybe just return existing sub?  But probably a mistake
    const existing = this._queries.get(spec);
    if (existing) {
      // console.log("This spec already exists", spec);
      // @ts-ignore: the types don't match for some reason
      return existing;
    }

    const a = this._a.addQueryFromSpec(spec);
    const b = this._b.addQueryFromSpec(spec);
    const sub = sync({ src: { a, b }, mergeOnly: true }).transform(
      tx.map(({ a, b }) => new ArraySet(tx.concat(a || [], b || []), OPTS))
    );

    // @ts-ignore
    this._queries.set(spec, sub);

    return sub;
  }
}
