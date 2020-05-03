define([
  "@thi.ng/rstream",
  "@thi.ng/transducers",
  "@thi.ng/hiccup",
  "@thi.ng/transducers-hdom",
  "@def.codes/rstream-query-rdf",
  "@def.codes/meld-core",
  "@def.codes/dom-process",
], async (rs, tx, hiccup, th, rdf, { q, monotonic_system }, dp) => {
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
      } else if (operation.type === "contains-text") {
        children.push(operation.text);
      } else if (operation.type === "contains-markup") {
        // more general case of contains text?
      }
    }
    return { element, attributes, children };
  };

  // dom process take 2

  // need to replace placeholder reference with Placeholder component

  const Placeholder = {
    init(element, context, { id }) {
      context.mounted({ id, element });
    },
    render(_, { id }) {
      return ["div", { "data-placeholder": id, __skip: true }];
    },
    release() {
      console.log("RELEASE!!");
    },
  };

  const transform_expression = expression =>
    expression.element === "placeholder"
      ? [Placeholder, { id: expression.attributes.id }]
      : [
          expression.element,
          expression.attributes,
          tx.map(
            expr =>
              typeof expr === "string" || typeof expr === "number"
                ? expr
                : transform_expression(expr),
            expression.children || []
          ),
        ];

  const make_dom_process = root => {
    const elements = new Map(); // mounted element, if any
    const templates = new Map(); // last-provided template (expression), if any
    const sources = new Map(); // pubsub subscriber for placeholder
    const feeds = new Map(); // placeholder content sink.  METASTREAM?

    const pluck_content = tx.pluck("content");
    const pubsub = rs.pubsub({ topic: _ => _.id });
    const ensure_source = id => {
      if (!sources.has(id))
        sources.set(
          id,
          // Don't tear down when removing last subscriber.
          // This is meant to survive even if element changes.
          pubsub.subscribeTopic(id, pluck_content, { closeOut: false })
        );
      return sources.get(id);
    };

    // Used by template/placeholder component
    const ctx = { mounted: _ => process.mounted.next(_) };

    const connect_if_mounted = id => {
      const element = id ? elements.get(id) : root;
      if (element && !feeds.has(id)) {
        // Automatically sends the latest value (if one arrived first)
        feeds.set(
          id,
          ensure_source(id).transform(
            tx.map(transform_expression),
            th.updateDOM({ root: element, ctx })
          )
        );
      }
    };

    const process = {
      // stream where client writes content for placeholders
      content: rs.subscription({
        next(value) {
          const { id } = value;
          ensure_source(id);
          pubsub.next(value);
          connect_if_mounted(id);
        },
      }),
      // exposed so it can be monitored, but used internally
      mounted: rs.subscription({
        next({ id, element }) {
          // Unsubscribe feed if element is changing...
          // OR, maybe could use metastream
          const old_element = elements.get(id);
          if (old_element && old_element !== element) {
            console.log("ELEMENT IS CHANGING", old_element, element);
            const feed = feeds.get(id);
            if (feed) {
              console.log("Unsubscribing feed");
              feed.unsubscribe();
            }
          }
          elements.set(id, element);
          connect_if_mounted(id); // ??
        },
      }),
    };
    return process;
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

    // console.log(`representation triples`, representation_graph.triples);

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
  const create_interpreter_pipeline = (model_facts, dom_process) => {
    const recipe_graph = new RDFTripleStore(model_facts);
    const C = new RDFTripleStore();

    const { kitchen_graph } = model_interpreter({ recipe_graph });
    const { representation_graph } = representation_interpreter({
      input_graph: kitchen_graph,
    });
    // console.log(`kitchen_graph.triples`, kitchen_graph.triples);
    // console.log(`representation_graph.triples`, representation_graph.triples);

    const { templates } = dom_process_interpreter({ representation_graph });
    const uber_template = {
      element: "div",
      attributes: { source: "model" },
      children: Object.values(templates),
    };
    // const all_html = hiccup.serialize(uber_template);
    // dom_container.innerHTML = all_html;
    dom_process.content.next({ path: [], template: uber_template });
  };

  const connect_models_to_interpreter = (models, dom_process) => {
    for (const model of models) {
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
      userland_code: `Alice(isa(Woman))
Bob(isa(Person))
Woman(subclassOf(Person))
Man(subclassOf(Person))`,
    },
  ];

  // const dom_process = dp.make_dom_process();

  const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

  // test usage
  const root = document.querySelector("#rule-based-representation");
  const dom_process = make_dom_process(root);
  // dom_process.mounted.subscribe(rs.trace("MOUNTED"));
  // dom_process.content.subscribe(rs.trace("CONTENT"));
  dom_process.content.next({
    id: "def:root/never",
    content: {
      element: "p",
      children: ["Never seen because placeholder never placed"],
    },
  });
  rs.fromInterval(250).subscribe({
    next: value =>
      dom_process.content.next({
        id: "def:some-value",
        content: {
          element: "output",
          children: ["my value is", { element: "b", children: [value] }],
        },
      }),
  });

  dom_process.content.next({
    id: "",
    content: {
      element: "div",
      attributes: {},
      children: [
        {
          element: "header",
          children: [{ element: "h1", children: ["in the beginning"] }],
        },
        { element: "placeholder", attributes: { id: "def:some-value" } },
        { element: "placeholder", attributes: { id: "def:root/bananas" } },
        {
          element: "footer",
          children: [{ element: "q", children: ["and in the end"] }],
        },
      ],
    },
  });
  dom_process.content.next({
    id: "def:root/bananas",
    content: {
      element: "p",
      attributes: { resource: "http:brainstorms" },
      children: ["I ", { element: "i", children: ["loves"] }, " you, Porgy"],
    },
  });
  await timeout(7000);
  dom_process.content.next({
    id: "def:root/bananas",
    content: {
      element: "p",
      attributes: { resource: "http:brainstorms" },
      children: ["I ", { element: "i", children: ["loves"] }, " you, Bess"],
    },
  });
  await timeout(7000);
  dom_process.content.next({
    id: "def:root/bananas",
    content: {
      element: "p",
      attributes: { resource: "http:brainstorms" },
      children: ["I ", { element: "i", children: ["loves"] }, " you, Potato"],
    },
  });
  // console.log(`dom_process`, dom_process);
  // dom_process.notify_mounted((expression, context_getter, path) => {
  //   console.log(`DOM PROCESS MOUNTED`, { expression, context_getter, path });
  // });

  // connect_models_to_interpreter(examples, dom_process);
});
