(function() {
  if (!meld) throw "No meld system found!";

  meld.register_driver("traversalDriver", ({ q }) => ({
    claims: q(
      "Traversal isa Class",
      "startsFrom isa Property",
      // redundant?  anyway it's also a multivalue
      //"startsFrom domain Resource",
      "startsFrom range Traversal",
      "Traversal subclassOf Stream" // ??
    ),
    rules: [
      {
        comment: `description of a traversal`,
        when: q("?traversal startsFrom ?node"),
        then: () => {}
      }
    ]
  }));
})();
