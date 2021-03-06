import { Term } from "@def.codes/rdf-data-model";
import { PseudoTriples, IRDFTripleSource } from "./api";
import { factory } from "./factory";
import { is_variable } from "./terms";

// TODO: Normalizing here is a hack, it should be handled in RDFTripleStore's
// add query methods.
const rstream_variable = (term: Term): string | Term =>
  is_variable(term) ? `?${term.value}` : factory.normalize(term);

export const live_query = (store: IRDFTripleSource, where: PseudoTriples) =>
  store.addQueryFromSpec({
    q: [{ where: where.map(_ => _.map(rstream_variable)) }],
  });

// !!! WARNING !!! Avoid using this function.  In its current form, I'm pretty
// !!! sure there's a heap leak.
//
// Helper function for TripleStore to get results of a query immediately.
export const sync_query = (store: IRDFTripleSource, where: PseudoTriples) => {
  let results;
  const query = live_query(store, where).subscribe({
    next: result_set => (results = result_set),
  });
  // TODO: Currently, unsubscribing any query makes it impossible to add others,
  // due to the transitive closing of shared streams.  See
  // https://github.com/thi-ng/umbrella/issues/91
  // query.unsubscribe();
  // *UPDATE*: That was fixed a while ago.  Need tests here though.
  //
  // *UPDATE*: No, it still gives this error.  Setting `closeOut` and/or
  // `closeIn` to `CloseMode.NEVER` has no effect.  I think the intent was that
  // those options would be set on the upstream (store's internal streams).
  return results;
};
