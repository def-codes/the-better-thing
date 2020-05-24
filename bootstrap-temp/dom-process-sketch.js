define([
  "@thi.ng/transducers",
  "@def.codes/rstream-query-rdf",
  "@def.codes/meld-core",
  "@def.codes/expression-reader",
  "./hdom-regions.js",
  "./userland-code-cases.js",
  "./create-interpreter-graph.js",
], async (tx, rdf, core, { read }, dp, examples, ing) => {
  const { q, make_registry, interpret } = core;
  const { factory, Dataset, UnionGraph, live_query } = rdf;
  const { namedNode: n, variable: v, blankNode: b, literal: l } = factory;
  const { create_interpreter_graph } = ing;

  const h = tag => document.createElement(tag);

  // For now, use one dom_process instance per model
  // obviously this would be a good use case for dom process itself,
  // but we'd need actual unique (representation) IRI's across models
  const connect_models_to_interpreter = (models, dom_process) => {
    const root = document.querySelector("#rule-based-representation");

    const cont = model => {
      const article = h("article");
      article.setAttribute("resource", model.label);
      const model_code_id = `${model.label.replace(/\W+/g, "-")}`;
      const model_code = article.appendChild(h("code"));
      model_code.setAttribute("id", model_code_id);
      const model_interpretation_code = article.appendChild(h("code"));

      // > A space-separated list of other elements’ ids, indicating that those
      // > elements contributed input values to (or otherwise affected) the
      // > calculation.
      const recipe_output = article.appendChild(h("output"));
      recipe_output.setAttribute("for", model_code_id);
      const kitchen_output = article.appendChild(h("output"));
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
      // if (model.label !== "A ticker") continue;
      // nif (model.label !== "A ticker with a mapping listener") continue;
      // if (model.label !== "Reuse a transducer") continue;
      if (model.label !== "A forcefield") continue;
      // if (model.label !== "HDOM region reference") continue;
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
        {
          // Ran into an issue when these shared a registry.  Couldn't 100%
          // explain it, but using separate registries resolves.
          recipe_registry: make_registry(),
          kitchen_registry: make_registry(),
          recipe_facts,
          recipe_dom_process,
          kitchen_dom_process,
          recipe_element: the.recipe_output,
          kitchen_element: the.kitchen_output,
        }
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
