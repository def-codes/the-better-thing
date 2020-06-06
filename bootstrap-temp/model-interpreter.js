define(["@def.codes/meld-core"], ({ make_union_interpreter }) => {
  const MODEL_DRIVERS = [
    "rdfsPlusDriver",
    "streamDriver",
    "subscriptionDriver",
    "transducerDriver",
    "forcefieldDriver",
    "queryDriver",
  ];

  const model_interpreter = (dataset, registry, { recipe_graph }) => {
    const drivers = MODEL_DRIVERS;
    const { union, reservoir } = make_union_interpreter(recipe_graph, {
      registry,
      drivers,
    });
    return { kitchen_graph: union, implementation_graph: reservoir };
  };
  return { MODEL_DRIVERS, model_interpreter };
});
