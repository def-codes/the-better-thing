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
        dom_process.define("root", {
          element: "div",
          children: Array.from(elements, term => ({
            element: "placeholder",
            attributes: { id: term.value },
          })),
        });
      },
      error(error) {
        console.error("BIND_REP: constructing root template:", error);
      },
    });

    // Bind all other templates to their placeholders
    // Doesn't handle changes, unsubscription, etc
    sources.subscribe({
      next(streams) {
        // assumes they'll be the same streams each time?
        // like the unsub in dom-process-interpreter, prob unused for a while
        for (const [k, v] of comm) if (!streams.has(k)) v.unsubscribe();

        for (const [term, value] of streams) {
          if (!comm.has(term)) {
            const sub = value.subscribe(dom_process.port(term.value));
            comm.set(term, sub);
          }
        }
      },
    });
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
