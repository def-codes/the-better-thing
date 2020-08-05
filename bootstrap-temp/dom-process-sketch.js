define([
  "@thi.ng/transducers",
  "@thi.ng/rstream",
  "@def.codes/rstream-query-rdf",
  "@def.codes/meld-core",
  "@def.codes/expression-reader",
  "@def.codes/hdom-regions",
  "./userland-code-cases.js",
  "./create-interpreter-graph.js",
], async (tx, rs, rdf, core, { read }, dp, examples, ing) => {
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
      const model_assert_code = recipe_part.appendChild(h("textarea"));
      model_assert_code.setAttribute("class", "recipe recipe--assert");
      model_assert_code.setAttribute("spellcheck", "false");

      const recipe_code_details = h("details");
      const recipe_code = recipe_code_details.appendChild(h("code"));
      recipe_part
        .appendChild(recipe_code_details)
        .appendChild(h("summary")).innerText = "recipe code";

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
        recipe_code,
        model_code,
        model_assert_code,
        model_interpretation_code,
        recipe_output,
        kitchen_output,
      };
    };

    const dataset = new Dataset();
    const registry = make_registry();
    for (const model of models) {
      if (
        !(
          [
            // "MultipleListeners",
            // "PluckNullish",
            // "PluckNullishInput",
            // "MergeTrans",
            // "SyncTrans",
            // "NonEmptySpace",
            "Colors",
          ].includes(model.id) ||
          [
            // "A ticker with a listener",
            // "A ticker",
            // "A ticker with a mapping listener",
            // "Reuse a transducer",
            // "A forcefield with a force",
            // "A forcefield with bodies",
            // "A fully-functioning forcefield",
            // "HDOM regions bug repro",
            // "A query",
            // "A constant stream",
            // "HDOM region reference",
          ].includes(model.label)
        )
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

      // For adding to model
      const recipe_assert_stream = rs.subscription();
      recipe_assert_stream.transform(
        tx.map(code => interpret(read(code))),
        tx.sideEffect(facts => recipe_graph.into(facts))
      );
      the.model_assert_code.innerHTML = "";

      rs.fromEvent(the.model_assert_code, "keypress")
        .transform(
          tx.filter(_ => _.key === "Enter"),
          tx.map(_ => _.target.value)
        )
        .subscribe(recipe_assert_stream);

      const { kitchen_graph, recipe_graph } = create_interpreter_graph(
        dataset,
        {
          // TODO: require models to have an actual identifier
          id: model.id || model.label,
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
      recipe_code_stream.next(model.userland_code);

      the.model_code.addEventListener("input", event => {
        recipe_code_stream.next(event.target.value);
      });

      // Note that this does not dump all of the graphs involved, just the facts
      // introduced by each node.
      const dump = false;
      if (dump)
        console.log(
          "RESERVIORS",
          Array.from(dataset.namedGraphs, ([name, graph]) =>
            graph.triples
              .map(([s, p, o]) =>
                `${name} | ${s} ${p} ${o}`.replace(/\n/g, "\\n")
              )
              .sort()
              .join("\n")
          )
        );

      const trace_facts = (graph, element) => {
        if (graph)
          live_query(graph, q("?s ?p ?o")).subscribe({
            next: facts => {
              element.innerText = Array.from(
                facts,
                ({ s, p, o }) => `${s} ${p} ${o}`
              ).join("\n");
            },
          });
      };

      trace_facts(recipe_graph, the.recipe_code);
      trace_facts(kitchen_graph, the.model_interpretation_code);
    }
  };

  connect_models_to_interpreter(examples);
});
