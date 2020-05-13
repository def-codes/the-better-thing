define(["./union-interpreter.js"], ({ make_interpreter }) => {
  const model_interpreter = (dataset, registry, { recipe_graph }) => {
    const drivers = ["owlBasicDriver", "streamDriver", "subscriptionDriver"];
    const { union } = make_interpreter(recipe_graph, { registry, drivers });
    return { kitchen_graph: union };
  };
  return { model_interpreter };
});
