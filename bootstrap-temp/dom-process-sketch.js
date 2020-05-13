define([
  "@thi.ng/transducers",
  "@def.codes/rstream-query-rdf",
  "@def.codes/meld-core",
  "@def.codes/expression-reader",
  "./hdom-regions.js",
  "./userland-code-cases.js",
  "./dom-process-interpreter.js",
  "./model-interpreter.js",
  "./representation-interpreter.js",
], async (tx, rdf, core, { read }, dp, examples, dom_int, mod, r12n) => {
  const { q, make_registry, interpret } = core;
  const { factory, Dataset, UnionGraph, live_query } = rdf;
  const { namedNode: n, variable: v, blankNode: b, literal: l } = factory;
  const { dom_process_interpreter } = dom_int;
  const { model_interpreter } = mod;
  const { representation_interpreter } = r12n;

  const create_interpreter_graph = (dataset, registry, spec) => {
    const { id, recipe_facts, recipe_dom_process, kitchen_dom_process } = spec;
    const { name, graph: recipe_graph } = dataset.create_graph();
    recipe_graph.into(recipe_facts);

    // TEMP: View model directly, rather than interpreter
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

    bind_rep(recipe_rep, recipe_dom_process);
    bind_rep(kitchen_rep, kitchen_dom_process);

    return { recipe_graph, kitchen_graph };
  };

  // For now, use one dom_process instance per model
  // obviously this would be a good use case for dom process itself,
  // but we'd need actual unique (representation) IRI's across models
  const connect_models_to_interpreter = (models, dom_process) => {
    const root = document.querySelector("#rule-based-representation");
    const cont = model => {
      const article = document.createElement("article");
      article.setAttribute("resource", model.label);
      const model_code_id = `${model.label.replace(/\W+/g, "-")}`;
      const model_code = article.appendChild(document.createElement("code"));
      model_code.setAttribute("id", model_code_id);
      const model_interpretation_code = article.appendChild(
        document.createElement("code")
      );
      // > A space-separated list of other elements’ ids, indicating that those
      // > elements contributed input values to (or otherwise affected) the
      // > calculation.
      const recipe_output = article.appendChild(
        document.createElement("output")
      );
      recipe_output.setAttribute("for", model_code_id);
      const kitchen_output = article.appendChild(
        document.createElement("output")
      );
      kitchen_output.setAttribute("for", `${model_code_id}-kitchen`);
      root.appendChild(article);
      return {
        model_code,
        model_interpretation_code,
        recipe_output,
        kitchen_output,
      };
    };
    const dataset = new Dataset();
    const registry = make_registry();
    for (const model of models) {
      // if (model.label !== "A ticker with a listener") continue;
      const the = cont(model);
      the.model_code.innerText = model.userland_code;
      const recipe_dom_process = dp.make_dom_process();
      recipe_dom_process.mounted.next({
        id: "root",
        element: the.recipe_output,
      });
      const kitchen_dom_process = dp.make_dom_process();
      kitchen_dom_process.mounted.next({
        id: "root",
        element: the.kitchen_output,
      });
      const recipe_facts = interpret(read(model.userland_code));
      const { kitchen_graph, recipe_graph } = create_interpreter_graph(
        dataset,
        registry,
        { recipe_facts, recipe_dom_process, kitchen_dom_process }
      );
      live_query(kitchen_graph, q("?s ?p ?o")).subscribe({
        next: facts => {
          the.model_interpretation_code.innerText = Array.from(
            facts,
            ({ s, p, o }) => `${s} ${p} ${o}`
          ).join("\n");
        },
      });
    }
  };

  connect_models_to_interpreter(examples);
});
