define(["@def.codes/meld-core"], ({ make_union_interpreter }) => {
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
    { input_graph, subject_graph }
  ) => {
    const log = (triples, ...msgs) =>
      console.log(
        ...msgs,
        Array.from(triples, ([s, p, o]) => `${s} ${p} ${o}`).join("\n")
      );

    // A non-feedback extension that asserts a representation of all subjects.
    const representation_requests = dataset.create_graph();
    const subjects = make_union_interpreter(input_graph, {
      source: subject_graph || input_graph, // instead of union, hence non-feedback
      sink: representation_requests.graph,
      registry, // should not need registry though
      drivers: ["domRepresentEverythingDriver"],
    });

    // Extend previous result with representation descriptions (using feedback).
    const representations = dataset.create_graph();
    const blueprint = make_union_interpreter(subjects.union, {
      sink: representations.graph,
      registry, // should not need registry though
      drivers: ["domRepresentationDriver"],
    });

    // This is essentially the model interpreter
    const rep_kitchen = dataset.create_graph();
    const out = make_union_interpreter(blueprint.union, {
      sink: rep_kitchen.graph,
      registry,
      dom_root,
      dom_process,
      drivers: [
        "rdfsPlusDriver",
        "streamDriver",
        "subscriptionDriver",
        "transducerDriver",
        "domProcessDriver",
        "queryDriver",
        "forcefieldDriver",
      ],
    });
    // { reservoir, union, system }
    // log(out.union.triples, "REPRESENTATION INTERPRETER OUT");

    return { representation_graph: out.union };
  };

  return { representation_interpreter };
});
