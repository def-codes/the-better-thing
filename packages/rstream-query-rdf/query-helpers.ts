const rstream_variables = term =>
  term.termType === "Variable" ? `?${term.value}` : term;

// Helper function for TripleStore to get results of a query immediately.
export const sync_query = (store, where) => {
  let results;
  const query = store
    .addQueryFromSpec({
      q: [{ where: where.map(_ => _.map(rstream_variables)) }],
    })
    .subscribe({ next: result_set => (results = result_set) });
  // TODO: Currently, unsubscribing any query makes it impossible to add others,
  // due to the transitive closing of shared streams.  See
  // https://github.com/thi-ng/umbrella/issues/91
  // query.unsubscribe();
  return results;
};

export const live_query = (store, where) =>
  store.addQueryFromSpec({
    q: [{ where: where.map(_ => _.map(rstream_variables)) }],
  });
