define([
  "@thi.ng/transducers",
  "@def.codes/rstream-query-rdf",
  "./union-interpreter.js",
], (tx, { factory }, { make_interpreter }) => {
  const { namedNode: n } = factory;

  const ISA = n("isa");
  const DOM_ELEMENT = n("def:DomElement");
  const REPRESENTS = n("def:represents");
  const REPRESENTS_TRANSITIVE = n("def:representsTransitive");

  const representation_interpreter = (dataset, registry, { input_graph }) => {
    const drivers = [
      "domRepresentationDriver",
      "owlBasicDriver",
      "streamDriver",
      "subscriptionDriver",
    ];

    // Reservoir doesn't come from dataset
    const interpreter = make_interpreter(input_graph, { registry, drivers });

    // For each incoming subject, assert a representation.
    // Initial representations need to be *a priori* else feedback loop.
    // This could be done by a rule if it weren't subject to feedback
    // As it is, it's done as a one-time write.  Technically the interpreter
    // should control all access to reservoir.
    interpreter.reservoir.into([
      ...tx.mapcat(s => {
        // HACK. avoids blank nodes
        const rep = n(`representationOf${s.value}`);
        return [
          [rep, ISA, DOM_ELEMENT],
          // TEMP: Avoiding REPRESENTS_TRANSITIVE because it's really slow rn
          [rep, REPRESENTS, s],
        ];
      }, input_graph.subjects()),
    ]);

    return { representation_graph: interpreter.union };
  };
  return { representation_interpreter };
});
