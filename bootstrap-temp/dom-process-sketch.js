define([
  "@thi.ng/rstream",
  "@thi.ng/transducers",
  "@thi.ng/hiccup",
  "@def.codes/rstream-query-rdf",
  "@def.codes/meld-core",
], (rs, tx, hiccup, rdf, { q, monotonic_system }) => {
  const { factory, RDFTripleStore, sync_query } = rdf;
  const { namedNode: n, variable: v, blankNode: b, literal: l } = factory;

  const ISA = n("isa");
  const DOM_ELEMENT = n("def:DomElement");
  const REPRESENTS = n("def:represents");
  const MATCHES = n("def:matches");

  const ATTRIBUTE_EQUALS = /^\[(.+)="(.+)"\]$/;
  const assertion_from_css = selector => {
    const attribute_equals = selector.match(ATTRIBUTE_EQUALS);
    if (attribute_equals) {
      const [, name, value] = attribute_equals;
      return { type: "attribute-equals", name, value };
    }
    return { type: "unknown" };
  };

  function foobar() {
    const store = new RDFTripleStore();
    monotonic_system({ store });
    store.add([n("Alice"), n("name"), l("Alice")]);
    store.add([n("Alice"), n("isa"), n("Woman")]);
    store.add([n("Bob"), n("name"), l("Robert")]);
    store.add([n("Bob"), n("isa"), n("Man")]);
    store.add([n("Woman"), n("subclassOf"), n("Person")]);
    store.add([n("Man"), n("subclassOf"), n("Person")]);
    console.log("ALL TRIPLES SYNC", store.triples);
  }

  // foobar();

  const RULES = [
    {
      comment: `everything has a representation`,
      when: [],
      then: [],
    },
    {
      comment: `direct containment`,
      when: ["x contains y"],
      then: ["representation of x contains a representation of y"],
    },
  ];

  const do_it = store => {
    // convert all rules to queries
    // apply all queries to store
    // subscribe to results
  };

  // dom operations
  const apply_dom_operations = operations => {
    const initial_element = "div";
    const attributes = {};
    const template = [initial_element, attributes];
    for (const operation of operations) {
      if (operation.type === "attribute-contains") {
        const { name, value } = operation;
        attributes[name] = attributes[name]
          ? attributes[name] + " " + value
          : value;
      } else if (operation.type === "attribute-equals") {
        attributes[operation.name] = operation.value;
      } else if (operation.type === "contains-text") {
        template.push(operation.text);
      } else if (operation.type === "contains-markup") {
        // more general case of contains text?
      }
    }
    return template;
  };

  // dom process
  const dom_process = () => {
    const providers = new Map();
    const consumers = new Map();
    const state = { providers, consumers };
    const provided = rs.stream();
    const consumed = rs.stream();
    return { provided, consumed };
  };

  // Dom element driver
  const dom_element_driver = {
    rules: [
      {
        when: ["?x", "a", "DomElement"],
        then: ({ x }) => {
          const operations = [];
          const template = template_from_operations(operations);
          // TODO: x is the rep, not the resource... *but*, how does it get set
          // as the identifier when making child reps.
          dp.set_template(x.value, template);
        },
      },
    ],
  };

  // listen for each representation
  const rep_query = ["?x", "a", "DomElement"];
  const rep_results_handler = projections => {
    for (const projection of projections) {
    }
  };

  // map rules into templates

  // * create interpreter interface for connecting custom logic to a graph
  // * modify system to support interpreter interface
  // * create a "model" interpreter that includes RDFS+ and dataflow drivers
  const model_interpreter = ({ recipe_graph }) => {
    // NOTE: Just copies, doesn't subscribe
    const kitchen_graph = new RDFTripleStore(recipe_graph.triples);
    const system = monotonic_system({
      store: kitchen_graph,
      drivers: ["owlBasicDriver"],
    });
    return { kitchen_graph };
  };

  // * create a representation interpreter that writes r12n facts to a new graph
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
      drivers: ["domRepresentationDriver"],
    });

    //
    console.log(`representation triples`, representation_graph.triples);

    return { representation_graph };
  };

  // * create a dom process interpreter that constructs templates
  const dom_process_interpreter = ({ representation_graph: graph }) => {
    // Get all the things that are dom representations and all their facts
    const reps = sync_query(graph, q("?ele isa def:DomElement"));
    const templates = {};
    for (const { ele } of reps) {
      const matches = sync_query(graph, [[ele, n("def:matches"), v("sel")]]);
      const operations = Array.from(matches, _ =>
        assertion_from_css(_.sel.value)
      );
      const template = apply_dom_operations(operations);
      templates[ele.value] = template;
    }

    return { templates };
  };

  // * create minimal dom process implementation
  // * create minimal hdom adapter for dom process (leaving extra element if necessary)
  // * copy facts from incoming model graph into graph for r12n interpretation
  // * connect model to r12n interpreter
  // * connect r12n interpreter to dom process interpreter
  // * support attribute-contains rule
  // * support contains-text rule

  // * create function to implement interpreter pipeline
  const create_interpreter_pipeline = (model_facts, dom_container) => {
    const recipe_graph = new RDFTripleStore(model_facts);
    const C = new RDFTripleStore();

    const { kitchen_graph } = model_interpreter({ recipe_graph });
    const { representation_graph } = representation_interpreter({
      input_graph: kitchen_graph,
    });
    // console.log(`kitchen_graph.triples`, kitchen_graph.triples);
    // console.log(`representation_graph.triples`, representation_graph.triples);

    const { templates } = dom_process_interpreter({ representation_graph });
    const all_html = hiccup.serialize([
      "div",
      { source: "model" },
      Object.values(templates),
    ]);
    dom_container.innerHTML = all_html;

    return;
    // use DOM process
    const dp = dom_process();
  };

  const get_dom_container_for = model => {
    return document.body.appendChild(document.createElement("div"));
  };

  const connect_models_to_interpreter = models => {
    for (const model of models) {
      const dom_container = get_dom_container_for(model);
      // const facts = read_facts_from(example.userland_code);
      const { facts } = model;
      create_interpreter_pipeline(facts, dom_container);
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
      userland_code: `Alice(isa(Woman))
Bob(isa(Person))
Woman(subclassOf(Person))
Man(subclassOf(Person))`,
    },
  ];

  // * connect example models to interpreter pipeline
  connect_models_to_interpreter(examples);
});
