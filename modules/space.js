// Let's write this as logical rules, people!
define(["d3-force", "./d3-driver"], (d3, d3d) => {
  const { box_simulation_node, force_from_description } = d3d;

  // When the scanner encounters something that's a space...
  const scan_rule = {
    when: ["a", "Space"],
    *then(spec) {
      // Initialize the space from a literal form
      //
      // Initialize, or conform?  It behaves like conform, but depends on how you assert.

      // In both of the following cases, the question arises whether we need to interpret the subordinate specs

      // Initialize the nodes based on the spec
      // (rn everything but `a` from the spec is treated as a body)
      const { a, ...bodies } = spec;
      yield ["init", ["name", "nodes"], bodies];

      // Initialize the forces based on the spec
      const force_specs = spec["d3:forces"];
      if (force_specs)
        // The reader should read them as forces.  What you're doing here is
        // just saying that they belong to the space.
        yield ["init", ["name", "forces"], force_specs];
    },
  };

  // A bunch of garbage for handling a space
  // But this isn't at all about handling a space, it's all about forcefield
  //
  // Given: we already know it's a space....
  //
  // What is the context here?  What are we interpreting?
  // There's no argument.
  function* interpret() {
    // PORTS.  should make dataflow nodes
    yield ["define-port", { name: "ticker" }];
    yield ["define-port", { name: "nodes" }];
    yield ["define-port", { name: "forces" }];

    // WHEN nodes are supplied to this port, provide them to the simulation.
    //
    // Map a given map to the objects for d3 forceSimulation.
    yield [
      "dataflow-node",
      {
        name: "set-nodes",
        source: ["name", "nodes"],
        transform: [
          "map",
          // This mapping creates a new object that uses the “real” object as
          // its prototype.  This way force (parameter) initializer functions
          // can still read the nodes' at-large properties.
          nodes =>
            Object.entries(nodes).map(([id, node]) =>
              box_simulation_node(node, id)
            ),
        ],
      },
    ];

    // THINGS THAT DEPENEND ON THE SIMULATION

    const sim = d3.forceSimulation().stop();

    // Okay... what you reeeeeeeallly want to do here is to tell the space that
    // the things are updated and the positions should be set according to the
    // given map.  One would expect the space to respond to messages saying that
    // things should have a certain position.  And in what form exactly... I mean
    // we would like a map by id.

    // const styles_id = `${space_id}.xy-styles`;
    // // What you really want is a css assert
    // // But (very) non-monotonic
    // // Update-in-place, "non-knowledge"
    // yield ["dom-assert", space_id, { type: "contains", id: styles_id }];
    // yield ["dom-assert", styles_id, { type: "uses-element", name: "style" }];

    yield [
      "dataflow-node",
      {
        // Meaning the ticker port on this thing...
        name: "css",
        comment:
          "The CSS mapping the forcefield output to CSS variables for the elements",
        source: ["id", "ticker"],
        transform: [
          "map",
          nodes => {
            // CLOSES OVER simulation nodes
            const css = sim
              .nodes()
              .map(_ => {
                const _id = `${space_id}.${_.id}`;
                return `
[id="${id}"], [data-x-source="${id}"] { --x:${_.x.toFixed(1)}; }
[id="${id}"], [data-y-source="${id}"] { --y:${-_.y.toFixed(1)}; }
[id="${id}"], [data-vx-source="${id}"] { --vx:${_.vx.toFixed(1)}; }
[id="${id}"], [data-vy-source="${id}"] { --vy:${-_.vy.toFixed(1)}; }
`;
              })
              .join("\n");

            return css;
          },
        ],
      },
    ];

    // Apply forces
    yield [
      "dataflow-node",
      {
        name: "apply-forces",
        source: ["name", "forces"],
        transform: [
          "sideEffect",
          force_specs => {
            for (const [force_name, force_spec] of Object.entries(
              force_specs
            )) {
              sim.force(force_name, force_from_description(force_spec));
            }
          },
        ],
      },
    ];

    yield [
      "dataflow-node",
      {
        name: "assert-position-rules",
        source: ["name", "css"],
        transform: [
          "map",
          css => ["dom-assert", styles_id, { type: "text-is", text: css }],
        ],
      },
    ];

    // Start the simulation
    yield [
      "dataflow-node",
      { name: "energy", source: ["raf"], sink: ["name", "ticker"] },
    ];

    // A thing I made up
    yield ["live-assert", { source: ["id", "assert-position-rules"] }];
  }
  return { scan_rule, interpret };
});
