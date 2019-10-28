// Map from traversal id to the most recent value
const TRAVERSAL_STATE = new WeakMap();

const TRAVERSAL_DRIVER = {
  claims: q(
    "Traversal isa Class",
    "startsFrom isa Property",
    // redundant?  anyway it's also a multivalue
    //"startsFrom domain Resource",
    "startsFrom range Traversal",
    "Traversal subclassOf Stream" // ??
    // properties of traversal:
    // properties it will follow
    // properties it will skip
    // constraints on properties it will follow forwards or backwards
    // "ForwardOnly subclassOf Traversal",
  ),
  rules: [
    {
      when: q("?traversal isa Traversal"),
      then: ({ traversal }, system) => {
        const instance = system.find(traversal);
        if (instance) {
          // But actually here you would gather the properties and compare them
          // to those used last time.
          console.log(`instance already found`, instance, "for", traversal);
          return;
        }

        // Synchronously query the properties of the traversal.
        const res = system.query_all(q(`${traversal.value} startsFrom ?o`));
        const starts = Array.from(res, ({ o }) => o);

        // ignore property constraints for now
        //const follows = system.query_all(q(`?s follows ?o`));

        const subscription = system
          // *Any* change could affect the selection.
          .live_query(q(`?s ?p ?o`))
          .transform(
            tx.map(() => traverse_all(system.store, starts)),
            tx.keep(),
            tx.dedupe(thi.ng.equiv.equiv)
          );

        // Don't use "Traverseal" because system doesn't know about subclasses
        system.register(traversal, "Subscribable", () => subscription);
        // subscription.transform(
        //   tx.trace("raw"),
        //   tx.map(set => [...set]),
        //   tx.trace("cooked")
        // );

        // or does the system do this?
        // anyway still need to register it for this to matter
        const sub_id = mint_blank();
        system.store.add([sub_id, IMPLEMENTS, traversal]);

        // this can be used by other drivers (which have access to system.find)
        // to listen on the appropriate results, and can act on their own
        // subscriptions.

        // so... you may still want to register the subscription, but...

        subscription.transform(
          tx.sideEffect(value => {
            const previous_value = TRAVERSAL_STATE.get(traversal);
            if (previous_value)
              system.store.delete([traversal, VALUE, previous_value]);
            const new_value = rdf.literal(value);
            system.store.add([traversal, VALUE, new_value]);
            TRAVERSAL_STATE.set(traversal, new_value);
          })
        );
      }
    }
  ]
};

if (meld) meld.register_driver(TRAVERSAL_DRIVER);
else console.warn("No meld system found!");
