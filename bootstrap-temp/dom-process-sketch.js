define([
  "@thi.ng/hiccup",
  "@thi.ng/transducers",
  "@thi.ng/rstream",
  "@def.codes/rstream-query-rdf",
  "@def.codes/meld-core",
  "@def.codes/expression-reader",
  "@def.codes/hdom-regions",
  "./userland-code-cases.js",
  "./create-interpreter-graph.js",
], async (hiccup, tx, rs, rdf, core, { read }, dp, examples, ing) => {
  // TODO: submit patch upstream.
  hiccup.NO_SPANS.style = 1;

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
      article.setAttribute("class", "model");
      const model_code_id = `${model.label.replace(/\W+/g, "-")}`;

      const recipe_part = article.appendChild(h("section"));
      recipe_part.setAttribute("data-part", "recipe");
      const kitchen_part = article.appendChild(h("section"));
      kitchen_part.setAttribute("data-part", "kitchen");

      const model_code = recipe_part.appendChild(h("textarea"));
      model_code.setAttribute("id", model_code_id);
      model_code.setAttribute("class", "recipe");
      model_code.setAttribute("spellcheck", "false");

      // > A space-separated list of other elements’ ids, indicating that those
      // > elements contributed input values to (or otherwise affected) the
      // > calculation.
      const recipe_output_details = h("details");
      recipe_output_details.setAttribute("open", "true");
      recipe_part
        .appendChild(recipe_output_details)
        .appendChild(h("summary")).innerText = "recipe representation";
      const recipe_output = recipe_output_details.appendChild(h("output"));
      recipe_output.setAttribute("for", model_code_id);
      const kitchen_output = kitchen_part.appendChild(h("output"));
      kitchen_output.setAttribute("for", `${model_code_id}-kitchen`);
      const kitchen_code_details = h("details");
      const model_interpretation_code = kitchen_code_details.appendChild(
        h("code")
      );
      kitchen_part
        .appendChild(kitchen_code_details)
        .appendChild(h("summary")).innerText = "kitchen code";

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
      if (
        ![
          // "A ticker with a listener",
          // "A ticker",
          // "A ticker with a mapping listener",
          // "Reuse a transducer",
          // "A forcefield with a force",
          // "A forcefield with bodies",
          "A fully-functioning forcefield",
          // "A query",
          // "A constant stream",
          // "HDOM region reference",
        ].includes(model.label)
      )
        continue;
      const the = cont(model);
      // TODO: escape.  there is some code for this in packages that takes into
      // account e.g. </textarea> closing tag
      the.model_code.innerHTML = model.userland_code;
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
      const recipe_code_stream = rs.subscription();
      const recipe_facts_stream = recipe_code_stream.transform(
        tx.map(code => interpret(read(code)))
      );

      recipe_code_stream.next(model.userland_code);

      const { kitchen_graph, recipe_graph } = create_interpreter_graph(
        dataset,
        {
          // Ran into an issue when these shared a registry.  Couldn't 100%
          // explain it, but using separate registries resolves.
          recipe_registry: make_registry(),
          kitchen_registry: make_registry(),
          recipe_facts_stream,
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
