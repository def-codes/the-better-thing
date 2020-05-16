define([
  "./dom-process-interpreter.js",
  "./model-interpreter.js",
  "./representation-interpreter.js",
], (dom_int, mod, r12n) => {
  const { dom_process_interpreter } = dom_int;
  const { model_interpreter } = mod;
  const { representation_interpreter } = r12n;

  const bind_rep = ({ top_level, templates }, dom_process) => {
    // Construct a main template to contain all top-level items
    dom_process.content.next({
      id: "root",
      content: {
        element: "div",
        children: Array.from(top_level, id => templates[id]),
      },
    });

    // Bind all other templates to their placeholders
    for (const [id, content] of Object.entries(templates))
      dom_process.content.next({ id, content });
  };

  const create_interpreter_graph = (dataset, registry, spec) => {
    const { id, recipe_facts, recipe_dom_process, kitchen_dom_process } = spec;
    const { name, graph: recipe_graph } = dataset.create_graph();
    recipe_graph.into(recipe_facts);

    const { kitchen_graph } = model_interpreter(dataset, registry, {
      recipe_graph,
    });

    const model_representation_graph = representation_interpreter(
      dataset,
      registry,
      { input_graph: recipe_graph }
    ).representation_graph;

    const kitchen_representation_graph = representation_interpreter(
      dataset,
      registry,
      { input_graph: kitchen_graph }
    ).representation_graph;

    const recipe_rep = dom_process_interpreter({
      representation_graph: model_representation_graph,
    });

    const kitchen_rep = dom_process_interpreter({
      representation_graph: kitchen_representation_graph,
    });

    bind_rep(recipe_rep, recipe_dom_process);
    bind_rep(kitchen_rep, kitchen_dom_process);

    return { recipe_graph, kitchen_graph };
  };

  return { create_interpreter_graph };
});
