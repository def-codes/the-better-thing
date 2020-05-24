define([
  "./dom-process-interpreter.js",
  "./model-interpreter.js",
  "./representation-interpreter.js",
], (dom_int, mod, r12n) => {
  const { dom_process_interpreter } = dom_int;
  const { model_interpreter } = mod;
  const { representation_interpreter } = r12n;

  const bind_rep = ({ top_level, sources }, dom_process) => {
    // The subscription mapping each element's template stream to the dom process
    const comm = new Map();

    top_level.subscribe({
      next(elements) {
        // Construct a main template to contain all top-level items
        //
        // This is effectively equivalent to asserting direct containment
        // between the root and each of the top level items.  Can't currently do
        // that in a matching rule because it requires a negative assertion
        // (viz, elements that have no container.).
        dom_process.define("root", {
          element: "div",
          children: Array.from(elements, term => ({
            element: "placeholder",
            attributes: { id: term.value },
          })),
        });
      },
      error: error => console.error("BIND_REP:", error),
    });

    // Bind all other templates to their placeholders
    sources.subscribe({
      next(streams) {
        for (const [term, value] of streams) {
          if (!comm.has(term)) {
            const sub = value.subscribe(dom_process.ports.get(term.value));
            comm.set(term, sub);
          }
        }

        // assumes they'll be the same streams each time?
        // like the unsub in dom-process-interpreter, prob unused for a while
        for (const k of [...comm.keys()])
          if (!streams.has(k)) {
            comm.get(k).unsubscribe();
            comm.delete(k);
          }
      },
    });
  };

  const create_interpreter_graph = (dataset, spec) => {
    const {
      id,
      recipe_registry,
      kitchen_registry,
      recipe_facts,
      recipe_dom_process,
      kitchen_dom_process,
      recipe_element,
      kitchen_element,
    } = spec;
    const { name, graph: recipe_graph } = dataset.create_graph();
    recipe_graph.into(recipe_facts);

    const { kitchen_graph } = model_interpreter(dataset, kitchen_registry, {
      recipe_graph,
    });

    const model_representation_graph = representation_interpreter(
      dataset,
      recipe_registry,
      recipe_dom_process,
      recipe_element,
      { input_graph: recipe_graph }
    ).representation_graph;

    const kitchen_representation_graph = representation_interpreter(
      dataset,
      kitchen_registry,
      kitchen_dom_process,
      kitchen_element,
      { input_graph: kitchen_graph }
    ).representation_graph;

    const recipe_rep = dom_process_interpreter(model_representation_graph);
    const kitchen_rep = dom_process_interpreter(kitchen_representation_graph);

    bind_rep(recipe_rep, recipe_dom_process);
    bind_rep(kitchen_rep, kitchen_dom_process);

    return { recipe_graph, kitchen_graph };
  };

  return { create_interpreter_graph };
});
