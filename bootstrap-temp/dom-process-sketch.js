define([
  "@thi.ng/rstream",
  "@thi.ng/transducers",
  "@def.codes/rstream-query-rdf",
  "@def.codes/meld-core",
  "@def.codes/expression-reader",
  "./hdom-regions.js",
  "./userland-code-cases.js",
  "./dom-operations.js",
  "./union-interpreter.js",
], async (rs, tx, rdf, core, { read }, dp, examples, dom_ops, interp) => {
  const { q, make_registry, interpret } = core;
  const { factory, Dataset, UnionGraph, sync_query, live_query } = rdf;
  const { namedNode: n, variable: v, blankNode: b, literal: l } = factory;
  const { assertion_from_css, apply_dom_operations } = dom_ops;
  const { make_interpreter } = interp;

  const ISA = n("isa");
  const DOM_ELEMENT = n("def:DomElement");
  const REPRESENTS = n("def:represents");
  const REPRESENTS_TRANSITIVE = n("def:representsTransitive");
  const MATCHES = n("def:matches");
  const CONTAINS = n("def:contains");
  const CONTAINS_TEXT = n("def:containsText");

  const model_interpreter = (dataset, registry, { recipe_graph }) => {
    const drivers = ["owlBasicDriver", "streamDriver", "subscriptionDriver"];
    const { union } = make_interpreter(recipe_graph, { registry, drivers });
    return { kitchen_graph: union };
  };

  const representation_interpreter = (dataset, registry, { input_graph }) => {
    // TEMP: Disabled subscription until this can be supported without conflict
    const drivers = [
      "domRepresentationDriver",
      "owlBasicDriver",
      "streamDriver",
      "subscriptionDriver",
    ];

    // Reservoir doesn't come from dataset
    const { union, reservoir } = make_interpreter(input_graph, {
      // id,
      registry,
      drivers,
    });

    // For each incoming subject, assert a representation.
    // Initial representations need to be *a priori* else feedback loop.
    // This could be done by a rule if it weren't subject to feedback
    // As it is, it's done as a one-time write.  Technically the interpreter
    // should control all access to reservoir.
    reservoir.into([
      ...tx.mapcat(s => {
        // HACK. avoids blank nodes
        const rep = n(`representationOf${s.value}`);
        return [
          [rep, ISA, DOM_ELEMENT],
          // TEMP: Avoiding REPRESENTS_TRANSITIVE because it's really slow rn
          [rep, REPRESENTS, s],
        ];
      }, input_graph.subjects()),
    ]);

    return { representation_graph: union };
  };

  // construct templates from a graph containing representations
  const dom_process_interpreter = ({ representation_graph: graph }) => {
    // Get all the things that are dom representations and all their facts
    const reps = sync_query(graph, q("?ele isa def:DomElement")) || [];
    const contained = new Set(
      tx.map(
        _ => _.contained.value,
        sync_query(graph, q("?x def:contains ?contained")) || []
      )
    );

    const templates = {};
    for (const { ele } of reps) {
      const matches = sync_query(graph, [[ele, MATCHES, v("sel")]]) || [];
      const contains = sync_query(graph, [[ele, CONTAINS, v("rep")]]) || [];
      const texts = sync_query(graph, [[ele, CONTAINS_TEXT, v("text")]]) || [];
      const operations = [
        ...tx.map(_ => assertion_from_css(_.sel.value), matches),
        ...tx.map(_ => ({ type: "contains", id: _.rep.value }), contains),
        ...tx.map(_ => ({ type: "contains-text", text: _.text.value }), texts),
      ];
      const template = apply_dom_operations(operations);
      templates[ele.value] = template;
    }

    const top_level = Object.keys(templates).filter(it => !contained.has(it));
    return { templates, top_level };
  };

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
        {
          recipe_facts,
          recipe_dom_process,
          kitchen_dom_process,
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
