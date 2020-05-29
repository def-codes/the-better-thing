define(["@def.codes/rstream-query-rdf", "@def.codes/meld-core"], async (
  { Dataset },
  { q, q1, make_union_interpreter }
) => {
  const dataset = new Dataset();
  const { graph: recipe } = dataset.create_graph();

  const log = (msg, triples) =>
    console.log(
      msg,
      Array.from(triples, ([s, p, o]) => `${s} ${p} ${o}`).join("\n")
    );

  recipe.into(
    q(
      "Alice isa Woman",
      "Bob isa Man",
      "Man subclassOf Peron",
      "Alice hasInterval 1000"
    )
  );

  const drivers = [
    "rdfsPlusDriver",
    "streamDriver",
    "subscriptionDriver",
    "transducerDriver",
  ];
  const reservoir = dataset.create_graph().graph;

  recipe.added().subscribe({ next: t => log("RECIPE ADDED", [t]) });
  recipe.deleted().subscribe({ next: t => log("RECIPE REMOVED", [t]) });
  reservoir.added().subscribe({ next: t => log("RESERVOIR ADDED", [t]) });
  reservoir.deleted().subscribe({ next: t => log("RESERVOIR REMOVED", [t]) });

  reservoir.add(q1("This isa Propagated"));
  reservoir.into(q("This isa AlsoPropagated"));

  const interpreter = make_union_interpreter(recipe, {
    drivers,
    sink: reservoir,
  });
  const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));
  await timeout(300);
  log("RECIPE", recipe.triples);
  log("RESERVOIR", reservoir.triples);
  log("UNION", interpreter.union.triples);

  recipe.add(q1("Woman subclassOf Person"));
  recipe.delete(q1("Bob isa Man"));
  // NOTE currently inferences are not deleted even when supporting facts are
  // i.e. the system is “monotonic” as advertised
});
