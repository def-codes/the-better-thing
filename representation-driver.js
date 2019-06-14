// New rules:
// - a container can "contain" a single value
// - that value is expected to be a selection
// - a selection is a set of either resources or triples
// - the container will contain STANDARD representations of those things
// - the standard representations are just resource names and properties
// - a container can be a document or a space.  this only affects CSS class

(function() {
  const render_things = (_, resources_or_triples) => [
    "div",
    {},
    tx.map(
      thing =>
        is_node(thing) ? [render_resource, thing] : [render_triple, thing],
      resources_or_triples
    )
  ];

  const render_resource = () => ["div", "hello again"];

  const render_triple = (_, [s, p, o]) => [
    "div.Property",
    {
      "data-subject": s.value,
      "data-property": p.value,
      "data-object": o.value
    },
    s.value,
    " ",
    p.value,
    " ",
    o.value
  ];

  // “Default” (currently only) renderer for properties
  // I don't think this will be used as such.
  const render_triples = (_, triples) => [
    "div",
    tx.map(render_triple, triples)
  ];

  const all_values_for = (store, subject, property) =>
    tx.iterator(
      tx.comp(
        tx.map(index => store.triples[index]),
        tx.filter(([, p]) => p === property),
        tx.pluck(2)
      ),
      store.indexS.get(subject) || []
    );

  // given a store and a list of resources, render those resources and their
  // (non-node) properties.
  const render_resource_nodes = (_, { store, resources }) => {
    const literal_props = tx.transduce(
      // Limit to literal (value) props, as nodes and links are displayed
      // independently.  Allows links to be on separate layer.
      tx.filter(([, , o]) => o.termType === "Literal"),
      tx.groupByMap({ key: ([s]) => s }),
      store.triples
    );

    return [
      "div",
      {},
      tx.map(
        resource => [
          "div",
          {
            "data-resource": resource.value,
            class: [
              "Resource",
              ...tx.map(
                type => type.value,
                all_values_for(store, resource, TYPE) || []
              )
            ].join("  ")
          },
          [
            "div.resource-content",
            resource.value,
            !literal_props.has(resource)
              ? null
              : tx.map(
                  ([, p, o]) => [
                    "div",
                    { "data-property": p.value },
                    p.value,
                    " ",
                    o.value && o.value.toString()
                  ],
                  literal_props.get(resource)
                )
          ]
        ],
        resources
      )
    ];
  };

  const REPRESENTATION_DRIVER = {
    claims: q(
      "Representation isa Class",
      "ResourceRepresentation subclassOf Representation",
      // Interesting thing here is that runtime can “remove” representation of
      // things by extending this, i.e. by conjoining stricter criteria.
      "represents isa Property",
      "representsA isa Property",
      // function, whatever
      // "representsA domain Component",
      "representsA domain Type",
      // "represents domain Resource",
      // "represents range Representation",
      "ViewFacts hasClause AllFacts",
      "AllFacts hasSubject ?subject",
      "AllFacts hasPredicate ?predicate",
      "AllFacts hasObject ?object",
      "Everything tallies ViewFacts",
      "_host isa SuperContainer"
    ),

    rules: [
      {
        // Create the top-level containers
        // when: q("?container isa Container", "?container contains ?content"),
        // then({ container, content }, system) {
        when_all: q("?host isa SuperContainer"),
        then({}, system) {
          system.live_query(q("?s ?p ?o")).transform(
            //tx.map(({ s, p, o }) => [s, p, o]),
            tx.map(() => [render_things, system.store.triples]),
            updateDOM({ root: system.dom_root })
          );
        }
      }

      // {
      //   // Create the top-level containers
      //   when_all: q("?host isa SuperContainer"),
      //   then(host, system) {
      //     system.register(host, "SuperContainer", () =>
      //       system.live_query(q("?container isa Container")).transform(
      //         tx.map(containers => [
      //           "div.SuperContainer",
      //           tx.map(
      //             ({ container }) => [
      //               "div.Container",
      //               { "data-container": container.value, __skip: true }
      //             ],
      //             containers
      //           )
      //         ]),
      //         updateDOM({ root: system.dom_root }),
      //         tx.sideEffect(() => {
      //           for (const ele of system.dom_root.querySelectorAll(
      //             `[data-container]`
      //           )) {
      //             system.register(
      //               rdf.namedNode(ele.getAttribute("data-container")),
      //               "Container",
      //               () => ele
      //             );
      //           }
      //         })
      //       )
      //     );
      //   }
      // }
      // {
      //   when: q("?element implements ?container", "?element as Container"),
      //   then({ container, element }, system) {
      //     system.register(container, "Content", () =>
      //       system
      //         .live_query(q(`${container.value} contains ?content`))
      //         .transform(
      //           tx.map(contents => [
      //             render_things,
      //             {
      //               store: system.store,
      //               resources: tx.map(_ => {
      //                 console.log(`_`, _);

      //                 const input = _.content.value;
      //                 try {
      //                   const res = system.query_all(
      //                     q(`?ref implements ${input}`, `?ref as Subscribable`)
      //                   );
      //                   if (res) {
      //                     const val = system.find(res[0].ref).deref();
      //                     console.log(`val`, val);
      //                     return val;
      //                   }
      //                 } catch (error) {
      //                   console.log("ERROR: ", error);
      //                 }

      //                 return _.content;
      //               }, contents)
      //             }
      //           ]),
      //           updateDOM({ root: system.find(element) })
      //         )
      //     );
      //   }
      // },
      // {
      //   when: q("?stream implements ViewFacts", "?stream as Subscribable"),
      //   then({ stream }, system) {
      //     const stream_instance = system.find(stream);

      //     stream_instance.transform(
      //       tx.map(properties => [
      //         render_properties,
      //         tx.map(
      //           ({ subject: s, predicate: p, object: o }) => [s, p, o],
      //           properties
      //         )
      //       ])
      //       //updateDOM({ root: system.dom_root })
      //     );
      //   }
      // }
    ]
  };

  if (meld) meld.register_driver(REPRESENTATION_DRIVER);
  else console.warn("No meld system found!");
})();
