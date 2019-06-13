const TRIPLE_EQUIV = {
  equiv: (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2]
};

// Map from traversal id to the most recent value
const TRAVERSAL_STATE = new WeakMap();

/** Iterate all resource-valued triples reachable from any node in `starts`. */
function traverse_all(store, starts, follow) {
  const queue = [...starts];
  const visited = new Set();
  const out = new thi.ng.associative.ArraySet([], TRIPLE_EQUIV);
  while (queue.length > 0) {
    const subject = queue.pop();
    for (const index of store.indexS.get(subject) || []) {
      const triple = store.triples[index];
      const object = triple[2];
      if (is_node(object)) {
        out.add(triple);
        if (!visited.has(object)) {
          visited.add(object);
          queue.push(object);
        }
      }
    }
  }
  return out;
}

const TRAVERSAL_DRIVER = {
  claims: q(
    "Traversal isa Class",
    "startsFrom isa Property"
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

        system.register(traversal, () => subscription);
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
