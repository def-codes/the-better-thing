// representations are about the physical appearance
// but NOT the placement and orientation of a thing
//
// works at the level of individual resources and properties
//
// every FACT is represented as such
// every resource, too
// each has exactly ONE representation
// if you want to see “something” in more than one place,
// it's really two different things
//
// this is not about the DOM.  representation should be
// just data.  that way it can move between layers.
// in fact, it's not even data, but functions
//
// this is where hdom functions are composed
// but not applied
//
// the rule is that all things should have representations
// unless the model specifically dictates otherwise
//
// a representation is implemented by a subscription
// that transforms an object into hiccup

(function() {
  // “Default” (currently only) renderer for properties
  const render_properties = (_, properties) => [
    "div",
    tx.map(
      ([s, p, o]) => [
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
      ],
      properties
    )
  ];

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
            "data-thing": resource.value,
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
            {},
            !literal_props.has(resource)
              ? resource.value
              : tx.map(
                  ([, p, o]) => [
                    "div",
                    { "data-property": p.value },
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
      "EverythingWatcher hasClause EverythingScope",
      "EverythingScope hasSubject ?subject",
      "EverythingScope hasPredicate ?predicate",
      "EverythingScope hasObject ?object"
    ),

    rules: [
      {
        when: q("?stream implements EverythingWatcher"),
        then({ stream }, system) {
          const stream_instance = system.find(stream);
          stream_instance.transform(
            tx.map(properties => [
              render_properties,
              tx.map(
                ({ subject: s, predicate: p, object: o }) => [s, p, o],
                properties
              )
            ]),
            updateDOM({ root: system.dom_root })
          );
        }
      }
    ]
  };

  if (meld) meld.register_driver(REPRESENTATION_DRIVER);
  else console.warn("No meld system found!");
})();