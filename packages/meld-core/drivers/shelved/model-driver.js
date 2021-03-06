// still not 100% sure what this is about, or if it's a thing.
//
// TODO datafied resources belonging to the model.
(function() {
  const MODEL_DRIVER = {
    claims: q(
      "Model isa Class",
      // not sure what to call this.  say that subject is set of resources named
      // in object (assuming object refers to a selection)
      "tallies isa Property",
      "tallies domain Stream",
      "All isa SelectAll"
    ),
    rules: [
      {
        when: q("?all isa SelectAll"),
        then({ all }, system) {
          system.register(all, "SelectAll", () => {
            const sub = rs.subscription();
            sub.next(system.store.triples);
            return sub;
            //rs.stream(sub => sub.next(system.store.triples));
          });
        }
      },
      {
        when: q(
          "?set tallies ?query",
          "?source implements ?query",
          "?source as Subscribable"
        ),
        then({ set, source, query }, system) {
          system.register(set, "Subscribable", () =>
            system.find(source).transform(
              tx.map(triples =>
                tx.transduce(
                  tx.comp(
                    tx.multiplex(tx.pluck("subject"), tx.pluck("object")),
                    tx.cat(),
                    tx.filter(is_node)
                    // This can't be doing anything after the above filter
                    //tx.keep()
                  ),
                  tx.conj(),
                  triples
                )
              )
            )
          );
        }
      }
    ]
  };

  if (meld) meld.register_driver(MODEL_DRIVER);
  else console.warn("No meld system found!");
})();
