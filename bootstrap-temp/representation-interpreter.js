define([
  "@def.codes/meld-core",
  "@def.codes/rstream-query-rdf",
  "./model-interpreter.js",
], ({ make_union_interpreter }, { UnionGraph }, { MODEL_DRIVERS }) => {
  /*
      +---F---+
      |       |
      |       v
      |      assert_reps(F)       Non-feedback extension
      |       |                   asserting representations
      +-->U1<-+
          |
          |    R1<---+
          v    |     |
      +---U2<---+    dom_reps(F)   Feedback extension
      |   |          ^             “fleshing out” representations
      |   +----------+
      v

   */

  const representation_interpreter = (
    dataset,
    registry,
    dom_process,
    dom_root,
    { id, input_graph, subject_graph, implementation_graph }
  ) => {
    const log = (triples, ...msgs) =>
      console.log(
        ...msgs,
        Array.from(triples, ([s, p, o]) => `${s} ${p} ${o}`).join("\n")
      );

    // `dataset ` is currently unused.  It could be used to provide named graphs
    // as the `sink` option to the interpreters, but it's currently not needed.

    /* ====== Stage C: what is to be represented? ====== */

    // A non-feedback extension that asserts a representation of all resources
    // from the model.
    const C = make_union_interpreter(input_graph, {
      id: `${id}: stage C`,
      source: subject_graph || input_graph, // instead of union, hence non-feedback
      drivers: ["domRepresentEverythingDriver"],
    });

    /* ====== Stage D: how are things to be represented? ====== */

    // Extend previous result with representation descriptions (using feedback).
    const D = make_union_interpreter(C.union, {
      id: `${id}: stage D`,
      drivers: ["domRepresentationDriver"],
    });

    /* ====== Stage E: implement the representations ====== */

    // Stage E should subject to the interpreter anything specially asserted by
    // stages C and D and nothing more.
    const Ein = new UnionGraph(
      D.reservoir,
      implementation_graph
        ? new UnionGraph(implementation_graph, C.reservoir)
        : C.reservoir
    );
    // log(Ein.triples, `${id}: stage E input`);
    const E = make_union_interpreter(Ein, {
      id: `${id}: stage E`,
      registry,
      dom_root,
      dom_process,
      drivers: [...MODEL_DRIVERS, "domProcessDriver"],
    });
    const out = new UnionGraph(D.union, E.union);

    return { representation_graph: out };
  };

  return { representation_interpreter };
});
