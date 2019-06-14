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
// ^ that's not currently true
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
            {},
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
      "Everything tallies ViewFacts"
      // "ViewThings hasClause AllThings",
      // "AllThings hasSubject ?subject",
      // "AllThings hasPredicate ?predicate",
      // "AllThings hasObject ?object"
    ),

    rules: [
      {
        // and it's a hiccup function...
        // this should just be a stream transformation
        when: q("?component representsA ?type", "?thing isa ?type"),
        then({ component, thing, type }, system) {
          // then this is its representation qua that type
          system.assert();
        }
      },
      {
        when: q("?stream implements Everything"),
        then({ stream }, system) {
          system.find(stream).transform(
            tx.sideEffect(resources => {
              for (const resource of resources)
                system.assert([
                  resource,
                  rdf.namedNode("hasRepresentation"),
                  rdf.literal("foo")
                ]);
            })
          );
        }
      },
      {
        when: q("?stream implements Everything"),
        then({ stream }, system) {
          system
            .find(stream)
            .transform(
              tx.map(resources => [
                render_resource_nodes,
                { store: system.store, resources }
              ]),
              updateDOM({ root: system.dom_root })
            );
        }
      },
      {
        when: q("?stream implements ViewFacts"),
        then({ stream }, system) {
          const stream_instance = system.find(stream);
          stream_instance.transform(
            tx.map(properties => [
              render_properties,
              tx.map(
                ({ subject: s, predicate: p, object: o }) => [s, p, o],
                properties
              )
            ])
            //updateDOM({ root: system.dom_root })
          );
        }
      }
    ]
  };

  if (meld) meld.register_driver(REPRESENTATION_DRIVER);
  else console.warn("No meld system found!");
})();
