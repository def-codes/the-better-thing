define(["./union-interpreter.js"], ({ make_union_interpreter }) => {
  const model_interpreter = (dataset, registry, { recipe_graph }) => {
    const drivers = [
      "rdfsPlusDriver",
      "streamDriver",
      "subscriptionDriver",
      "transducerDriver",
      "forcefieldDriver",
    ];
    const { union } = make_union_interpreter(recipe_graph, {
      registry,
      drivers,
    });
    return { kitchen_graph: union };
  };
  return { model_interpreter };
});
