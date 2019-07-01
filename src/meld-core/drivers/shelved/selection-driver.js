(function() {
  const identity = x => x;
  const projectsOver = rdf.namedNode("projectsOver");

  const SELECTION_DRIVER = {
    // A selection is a set, in particular it's a set of resources.
    claims: q("Selection isa Class", "projectsOver range Selection"),
    rules: [
      // Support assertion of a link between any given resource and the
      // expansion of a set.  This could be done with an “ordinary” rule if we
      // had `forall` semantics in conclusion.
      {
        when: q(
          "?source projectsOver ?selection",
          "?target implements ?selection",
          "?target as Subscribable"
        ),
        then({ source, selection, target }, system) {
          console.log(`source, selection, target`, source, selection, target);
          system
            .find(target)
            .transform(
              tx.mapcat(identity),
              tx.sideEffect(o => system.assert([source, links, target]))
            );
        }
      }
    ]
  };

  if (meld) meld.register_driver(SELECTION_DRIVER);
  else console.warn("No meld system found!");
})();
