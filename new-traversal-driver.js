(function() {
  if (!meld) throw "No meld system found!";

  const { traverse_all } = triple_store_traversal;

  meld.register_driver("traversalDriver", ({ q }) => ({
    claims: q(
      "Traversal isa Class",
      "startsFrom isa Property",
      // redundant?  anyway it's also a multivalue
      //"startsFrom domain Resource",
      "startsFrom range Traversal",
      "Traversal subclassOf Selection" // ??
    ),
    rules: [
      {
        comment: `description of a traversal`,
        when: q("?traversal startsFrom ?node"),
        then: ({ traversal, node }, { store }) => {
          console.log(`traversal, node`, traversal, node);
          const result = traverse_all(store, [node]);
          // This works as expected, but what do we do with it?
          //
          // In particular, could this be used as the basis of a rule?
          // How would this be used as a userland expression?
          // it creates a subgraph
          // and how (and why) would it be used in a kernelspace rule?
          console.log(`result`, result);
          // the system can know that if it returns these results that, what?
          // it can assert, e.g. that the results are the value of something
          // it can assert that the results are related to something in some way
          // but the form of the condition is not fixed
          // i.e. it might not be able to meaningfully associate the premise
          // with a particular resource

          // what's clear:
          // - the value of the traversal is at issue here & must go somewhere
          // - this driver should not know about stream &c as such
          // - we are setting a runtime value here, not a model value
          // - repeat: we are NOT making a change to the model
          // - changes to this result represent a dataflow change
          //   - NOT a change to the underlying description
          // - changes to the runtime value will affect dataflow
          //   - but not the model (directly... other things might assert)
          // - if a runtime value represented by a model value “changes”...
          //   - isn't that non-monotonic?
          //     - no, by God, I'm saying it's not
          return {
            ["set runtime value"]: result
          };
        }
      }
    ]
  }));
})();
