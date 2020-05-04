define([
  "@thi.ng/rstream",
  "@thi.ng/transducers",
  "@def.codes/rstream-query-rdf",
  "@def.codes/meld-core",
  "./dom-process-new.js",
], async (rs, tx, rdf, { q, monotonic_system }, dp) => {
  const { factory, RDFTripleStore, sync_query } = rdf;
  const { namedNode: n, variable: v, blankNode: b, literal: l } = factory;

  const ISA = n("isa");
  const DOM_ELEMENT = n("def:DomElement");
  const REPRESENTS = n("def:represents");
  const MATCHES = n("def:matches");
  const CONTAINS = n("def:contains");
  const CONTAINS_TEXT = n("def:containsText");

  const ATTRIBUTE_EQUALS = /^\[(.+)="(.+)"\]$/;
  const ELEMENT = /^[a-z][a-z0-9]*$/;
  const assertion_from_css = selector => {
    const attribute_equals = selector.match(ATTRIBUTE_EQUALS);
    if (attribute_equals) {
      const [, name, value] = attribute_equals;
      return { type: "attribute-equals", name, value };
    }
    const element = selector.match(ELEMENT);
    if (element) {
      const [name] = element;
      return { type: "uses-element", name };
    }
    return { type: "unknown", selector };
  };

  // dom operations
  const apply_dom_operations = operations => {
    let element = "div";
    const attributes = {};
    const children = [];
    for (const operation of operations) {
      if (operation.type === "attribute-contains") {
        const { name, value } = operation;
        attributes[name] = attributes[name]
          ? attributes[name] + " " + value
          : value;
      } else if (operation.type === "attribute-equals") {
        attributes[operation.name] = operation.value;
      } else if (operation.type === "uses-element") {
        element = operation.name;
      } else if (operation.type === "contains-text") {
        children.push(operation.text);
      } else if (operation.type === "contains") {
        const { id } = operation;
        children.push({ element: "placeholder", attributes: { id } });
      } else {
        console.warn("unsupported operation!", operation);
      }
    }
    return { element, attributes, children };
  };

  const model_interpreter = ({ recipe_graph }) => {
    // NOTE: Just copies, doesn't subscribe
    const kitchen_graph = new RDFTripleStore(recipe_graph.triples);
    const system = monotonic_system({
      store: kitchen_graph,
      drivers: ["owlBasicDriver"],
    });
    return { kitchen_graph };
  };

  const representation_interpreter = ({ input_graph }) => {
    // NOTE: Just copies, doesn't subscribe.  This might not cut it, though.
    const representation_graph = new RDFTripleStore(input_graph.triples);

    // For each incoming subject, assert a representation.
    // Initial representations need to be *a priori* else feedback loop.
    // This could be done by a rule if it weren't subject to feedback
    representation_graph.into([
      ...tx.mapcat(s => {
        // HACK. avoids blank nodes
        const rep = n(`representationOf${s.value}`);
        return [
          [rep, ISA, DOM_ELEMENT],
          [rep, REPRESENTS, s],
        ];
      }, input_graph.indexS.keys()),
    ]);

    const system = monotonic_system({
      store: representation_graph,
      drivers: ["domRepresentationDriver", "owlBasicDriver"],
    });

    return { representation_graph };
  };

  // construct templates from a graph containing representations
  const dom_process_interpreter = ({ representation_graph: graph }) => {
    // Get all the things that are dom representations and all their facts
    const reps = sync_query(graph, q("?ele isa def:DomElement"));
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

  const create_interpreter_pipeline = (model_facts, dom_process) => {
    const recipe_graph = new RDFTripleStore(model_facts);

    // TEMP: View model directly, rather than interpreter
    // const { kitchen_graph } = model_interpreter({ recipe_graph });
    const { representation_graph } = representation_interpreter({
      input_graph: recipe_graph, //kitchen_graph,
    });

    const { templates, top_level } = dom_process_interpreter({
      representation_graph,
    });

    // Construct a main template to contain all top-level items
    dom_process.content.next({
      id: "",
      content: {
        element: "div",
        children: Array.from(top_level, id => templates[id]),
      },
    });

    // Bind all other templates to their placeholders
    for (const [id, content] of Object.entries(templates))
      dom_process.content.next({ id, content });
  };

  const connect_models_to_interpreter = (models, dom_process) => {
    const root = document.querySelector("#rule-based-representation");
    const cont = model => {
      const article = document.createElement("article");
      article.setAttribute("resource", model.label);
      return root.appendChild(article);
    };
    for (const model of models) {
      // For now, use one dom_process instance per model
      // obviously this would be a good use case for dom process itself,
      // but we'd need actual unique (representation) IRI's across models
      const container = cont(model);
      const dom_process = dp.make_dom_process(container);

      // const facts = read_facts_from(example.userland_code);
      const { facts } = model;
      create_interpreter_pipeline(facts, dom_process);
    }
  };

  const examples = [
    {
      label: "Single fact with literal",
      facts: [[n("Alice"), n("name"), l("Alice")]],
      userland_code: `Alice(name("Alice"))`,
    },
    {
      label: "Single fact with object value",
      facts: [[n("Alice"), n("isa"), n("Person")]],
      userland_code: `Alice(a(Person))`,
    },
    {
      label: "Two facts about one subject",
      facts: [
        [n("Alice"), n("name"), l("Alice")],
        [n("Alice"), n("isa"), n("Person")],
      ],
      userland_code: `Alice(isa(Person), name("Alice"))`,
    },
    {
      label: "Two subjects",
      facts: [
        [n("Alice"), n("isa"), n("Woman")],
        [n("Bob"), n("isa"), n("Man")],
      ],
      userland_code: `Alice(isa(Woman))
Bob(isa(Man))`,
    },
    {
      label: "Subclass inference",
      facts: [
        [n("Alice"), n("name"), l("Alice")],
        [n("Alice"), n("isa"), n("Woman")],
        [n("Bob"), n("isa"), n("Man")],
        [n("Woman"), n("subclassOf"), n("Person")],
        [n("Man"), n("subclassOf"), n("Person")],
      ],
      userland_code: `Alice(isa(Woman), name("woman"))
Bob(isa(Person))
Woman(subclassOf(Person))
Man(subclassOf(Person))`,
    },
  ];

  connect_models_to_interpreter(examples);
});
