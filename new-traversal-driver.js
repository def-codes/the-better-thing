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
          // In particular, could this be use as the basis of a rule?
          // How would this be used as a userland expression?
          // it creates a subgraph
          // and how (and why) would it be used in a kernelspace rule?
          console.log(`result`, result);
        }
      }
    ]
  }));
})();
