(function() {
  const NAME = "streamDriver";
  if (!meld) throw `${NAME}: No meld system found!`;

  const { rstream: rs, transducers: tx } = thi.ng;

  // Map the raw triples for a subject into a multi-valued JS object.
  const to_prop_dict = (store, triples) =>
    tx.transduce(
      tx.map(idx => store.triples[idx]),
      // Assume all values are potentially multiple, hence wrapped in array.
      tx.groupByObj({ key: ([, p]) => p }),
      triples
    );

  // Return a subscribable based on a description of a node
  const node_topology = spec => {
    let sub;

    let node_type;
    // Node type is determined by sources.
    //
    // It would seem preferable to be explicit about these types, i.e. reify
    // merge and sync, and just assert their existence.  The problem (besides
    // communicating this to the meta stream) is that you can't un-say it, and
    // you may need to.  The outcome of this is not necessarily monotonic.  In
    // other words, the type of a node could change as new facts are added.
    // Then you would not be able to retract e.g. a plain node you had created
    // in order to make it a merge node in practice.  So this aspect of the
    // topology must remain hidden pending some better approach.

    if (spec.listensTo.length > 1) {
      // How would you distinguish merge and sync if you weren't explicit about
      // them in the first place?  Will have to revisit sync later, as it seems
      // to call for a special vocabulary.
      node_type = "merge";
    } else {
      node_type = "plain";
    }

    if ((node_type = "plain")) {
      sub = rs.subscription();
    }
    if (node_type === "merge") {
      sub = rs.merge();
      // More work would be needed here to configure merge
    }
    if (node_type === "sync") {
      sub = rs.sync();
    }
    // (not doing pub sub here)
    return sub;
  };

  meld.register_driver(NAME, ({ q }) => ({
    claims: q(
      "Subscribable isa Class",
      "listensTo isa Property",
      "listensTo domain Subscribable",
      "listensTo range Listener"
    ),
    rules: [
      {
        //when: q("?meta implements ?subscribable", "?meta as MetaStream"),
        when: q("?meta isa Subscribable"),
        then: ({ meta, subscribable }, { store }) => {
          // Get a description of the thing
          //console.log(`store`, store.triples);
          console.log(`line 69`);

          const spec = meta;
          return {
            register: {
              subject: meta,
              as_type: "Foobar",
              get: () => {
                throw "noway pa";
              }
            }
          };
        }
      },
      {
        when: q("?subject isa Subscribable"),
        then: ({ subject }) => ({
          register: {
            subject,
            as_type: "MetaStream",
            // what to do here?
            // - who will put values to this?
            //   - this driver will.  whenever it has a definition for the object
            // - what value will it put?
            //   - enough information to construct (or reconstruct) the stream
            // - what will it return?
            //   - a new subscribable based on that description
            // - what about the state problem?
            //   - you will probably have to put in a dummy subscription
            get: () => rs.metaStream(some_value => some_stream_based_on_it)
          }
        })
      }
      /*
      {
        // Assumes only one thing can implement a resource as a subscribable.
        comment: `Subject subscribes to object once it is defined as subscribable`,
        when: q(
          "?a listensTo ?b",
          "?source implements ?b",
          "?source as Subscribable"
        ),
        then: () => {
          // the result is going to be a subscription that forwards values from
          // a to b...  unfortunately, it can't be that simple because you have
          // to have all of the information about the subscribable to construct
          // the right thing.
          return {
            register: {}
          };
        }
      }
      */
    ]
  }));
})();
