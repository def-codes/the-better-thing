// Utility for mocking iteration on a model using a monotonic implementation,
// which is not designed to deal with retractions.  So if you want to get the
// effect of arbitrary edits, you have to destroy the world and re-create it
// every time.  Options are same as monotonic_system, minus `store`.
const monotonic_world = opts => {
  let dispose_old_system;

  // Subscripton to all current facts, persisting over changing stores.
  const facts = rs.subscription();
  // const facts = rs.metaStream(store =>
  //   store
  //     .addQueryFromSpec({ q: [{ where: [["?s", "?p", "?o"]] }] })
  //     .transform(tx.map(() => store.triples))
  // );

  const read = (userland_code, world) =>
    new Function(
      "world",
      `with (world) { 
${userland_code}
}`
    )(world);

  let fact_push;

  function interpret(userland_code) {
    if (dispose_old_system) dispose_old_system();
    if (fact_push) fact_push.unsubscribe();

    const store = new thi.ng.rstreamQuery.TripleStore();
    //facts.next(store);
    fact_push = store
      .addQueryFromSpec({ q: [{ where: [["?s", "?p", "?o"]] }] })
      .transform(tx.sideEffect(() => facts.next(store.triples)));

    const interpreter = make_world(store);

    try {
      // DESTRUCTIVELY update store.  See note there
      // currently does not return a meaningful result
      read(userland_code, interpreter);
    } catch (error) {
      return { error, when: "reading-code" };
    }

    try {
      opts.dom_root.innerHTML = "";
      dispose_old_system = meld.monotonic_system({ ...opts, store });
    } catch (error) {
      return { error, when: "creating-system" };
    }

    return true;
  }

  return { interpret, facts };
};
