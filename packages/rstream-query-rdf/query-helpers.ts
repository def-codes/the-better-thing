import { Term } from "@def.codes/rdf-data-model";
import { PseudoTriples } from "./api";
import { factory } from "./factory";
import { RDFTripleStore } from "./rdf-triple-store";
import { Pattern } from "@thi.ng/rstream-query";

// TODO: Normalizing here is a hack, it should be handled in RDFTripleStore's
// add query methods.
const rstream_variable = (term: Term): string | Term =>
  term.termType === "Variable" ? `?${term.value}` : factory.normalize(term);

export const live_query = (store: RDFTripleStore, where: PseudoTriples) =>
  store.addQueryFromSpec({
    q: [{ where: where.map(_ => _.map(rstream_variable) as Pattern) }],
  });

// Helper function for TripleStore to get results of a query immediately.
export const sync_query = (store: RDFTripleStore, where: PseudoTriples) => {
  let results;
  const query = live_query(store, where).subscribe({
    next: result_set => (results = result_set),
  });
  // TODO: Currently, unsubscribing any query makes it impossible to add others,
  // due to the transitive closing of shared streams.  See
  // https://github.com/thi-ng/umbrella/issues/91
  // query.unsubscribe();
  return results;
};
