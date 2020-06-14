define(["@def.codes/meld-core"], ({ make_union_interpreter }) => {
  const MODEL_DRIVERS = [
    "rdfsPlusDriver",
    "streamDriver",
    "subscriptionDriver",
    "transducerDriver",
    "spaceDriver",
    "forcefieldDriver",
    "queryDriver",
  ];

  const model_interpreter = (dataset, registry, { recipe_graph, id }) => {
    const drivers = MODEL_DRIVERS;
    const { union, reservoir } = make_union_interpreter(recipe_graph, {
      id,
      sink: dataset.create_graph(dataset.factory.namedNode(id)).graph,
      registry,
      drivers,
    });
    return { kitchen_graph: union, implementation_graph: reservoir };
  };
  return { MODEL_DRIVERS, model_interpreter };
});
