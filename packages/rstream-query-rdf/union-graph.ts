import type { QuerySpec, QuerySolution } from "@thi.ng/rstream-query";
import { PseudoTriple, IRDFTripleSource, IRDFTripleEvents } from "./api";
import { RDFTripleStore } from "./rdf-triple-store";

// Not used since switching to a concrete backing store, but may end up useful
// some other place.
//
// ASSUMES that solutions have the same keys
// ASSUMES that solution values can use equality comparison
// const solution_equals = (a: Solution, b: Solution) =>
//   Object.keys(a).every(k => a[k] === b[k]);
//
// ArraySet by itself works, but this is optimized for assumptions
// const OPTS = { equiv: solution_equals };

/**
 * EXPERIMENTAL: a graph that appears as the simple union of two other graphs.
 */
export class UnionGraph implements IRDFTripleSource, IRDFTripleEvents {
  // This is a “computed” graph, but we need a concrete backing store in order
  // for queries towork where match spans across unioned inputs.  It may be
  // possible to do this via some combination of the sources' streams, but this
  // will have to do for now.  It does simplify the rest of the implementation,
  // at the cost of duplicate storage.
  private readonly _store = new RDFTripleStore();

  constructor(
    readonly _a: IRDFTripleSource & IRDFTripleEvents,
    readonly _b: IRDFTripleSource & IRDFTripleEvents
  ) {
    _a.added().subscribe({ next: triple => this._store.add(triple) });
    _b.added().subscribe({ next: triple => this._store.add(triple) });
    _a.deleted().subscribe({
      next: triple => {
        if (!_b.has(triple)) this._store.delete(triple);
      },
    });
    _b.deleted().subscribe({
      next: triple => {
        if (!_a.has(triple)) this._store.delete(triple);
      },
    });
    this._store.into(_a.triples);
    this._store.into(_b.triples);
  }

  has(triple: PseudoTriple) {
    return this._store.has(triple);
  }

  subjects() {
    return this._store.subjects();
  }

  get triples() {
    return this._store.triples;
  }

  added() {
    return this._store.added();
  }

  deleted() {
    return this._store.deleted();
  }

  addQueryFromSpec(spec: QuerySpec): QuerySolution {
    return this._store.addQueryFromSpec(spec);
    /* see above
    // This only unions the *solutions*, each must match independently
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
*/
  }
}
