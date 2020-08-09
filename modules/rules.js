define([], () => {
  // This is a general rule.
  //
  // Emit this anyway because CSS rules might know about it
  //
  // ?x a ?t . ?e represents ?x -> ?e typeof contains ?t
  //
  // Non-monotonic: if this is retracted, the assertions need to be
  // recomputed.  The assertions are downstream from the type definitions
  // and upstream from the dom templates.
  //
  // sink(["dom-assert", { id, matches: `[typeof~="${type}"]` }]);

  const rules = [
    {
      // And what is the “current” space??
      comment:
        "If a number is put into the message sink, put it into the current space",
      when: {
        match: { $typeof: "number" },
      },
      // If this is the provided thing, then what happens when it's a match on e.g. prototype?
      // you ain't getting no references
      then: N => ({
        assert: "there exists a representation of the number N",
      }),
    },
    {
      comment: "A number is represented as itself",
    },
    {
      // See old code below
      comment: "simulation alpha.  good for heat map",
      when: ["?x a d3?ForceSimulation"],
      then: {},
    },
    {
      comment: "a buffer can indicate its cardinality with dots",
      when: ["?x a Buffer"],
      then: {
        /* there exist |buffer| dots in the buffer's representation */
        /* as distributed as possible, so you can see the count  */
      },
    },
  ];

  function* alpha_rules() {
    /*
    // Alpha updates on every frame.  This really should be a stream source.  There's
    // no reason to create it if there aren't any subscribers.

    yield [
      "dataflow-node",
      // CLOSES OVER simulation reference
      { source: ["id", "ticker"], transform: ["map", () => sim.alpha()] },
    ];

    alpha.transform(
      // Remember, this threshold is itself a var, i.e. this is a sync node
      // so yeah you can't have any constant, you really need to understand these exprs
      // but how do you do arbitrary, stateful, side-effecting lambdas?
      // yeah and why??
      tx.filter(a => a < 0.1),
      tx.sideEffect(() => forcefield_energy_source.done())
    );

    // Feed simulation alpha value to a CSS variable
    alpha.subscribe({
      next(value) {
        sink([
          "css-assert",
          id,
          `[id="${id}"], [data-simulation-alpha-source="${id}"]`,
          { "--simulation-alpha": value.toFixed(2) },
        ]);
      },
    });
*/
  }

  return { rules };
});
