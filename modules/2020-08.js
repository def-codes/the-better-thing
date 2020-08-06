define([
  "d3-force",
  "@thi.ng/rstream",
  "@thi.ng/transducers",
  "@def.codes/dom-rules",
  "@def.codes/hdom-regions",
  "./examples/index.js",
], (d3, rs, tx, dom_rules, dp, examples) => {
  // console.log(`examples`, examples);

  const { facts_to_operations, operations_to_template } = dom_rules;

  const make_space = spec => {
    const { id: space_id, sink } = spec;
    const sim = d3.forceSimulation().stop();
    const nodes = rs.subscription({
      next(nodes) {
        sim.nodes(nodes);
      },
    });
    const forces = rs.subscription({ next() {} });

    // Default forces (just for testing)
    sim.force("charge", d3.forceManyBody(-2000));
    sim.force("x-axis", d3.forceX(0).strength(0.5));
    sim.force("y-axis", d3.forceY(0).strength(0.4));
    sim.force("center", d3.forceCenter());

    // temp: periodically (disturb nodes and) re-warm alpha
    rs.fromInterval(1000).subscribe({
      next: () => {
        for (const node of sim.nodes()) {
          node.x = Math.random() * 2000 - 1000;
          node.y = Math.random() * 2000 - 1000;
        }
        sim.alpha(1);
      },
    });

    // const ticker = rs.fromInterval(150)
    const ticker = rs.fromRAF().transform(
      tx.sideEffect(() => sim.tick()),
      tx.map(() => sim.nodes())
      // tx.sideEffect(nodes => console.log("WUUT", ...nodes))
    );

    const styles_id = `${space_id}.styles`;
    sink(["dom-assert", space_id, { type: "contains", id: styles_id }]);

    ticker
      .transform(
        tx.map(nodes => {
          const css = sim
            .nodes()
            .map(_ => {
              const id = `${space_id}.${_.id}`;
              return `
[id="${id}"], [data-x-source="${id}"] { --x:${Math.round(_.x)}; }
[id="${id}"], [data-y-source="${id}"] { --y:${Math.round(-_.y)}; }
[id="${id}"], [data-vx-source="${id}"] { --vx:${Math.round(_.vx)}; }
[id="${id}"], [data-vy-source="${id}"] { --vy:${Math.round(-_.vy)}; }
`;
            })
            .join("\n");
          // if (space_id.includes("2")) {
          //   console.log("CSS", css);
          //   // console.log(`nodes`, nodes);
          //   // console.log(`sim.nodes()`, sim.nodes());
          //   // console.log(
          //   //   `sim.nodes() === nodes`,
          //   //   nodes.length,
          //   //   sim.nodes() === nodes,
          //   //   ...nodes
          //   // );
          // }

          return css;
        }),
        tx.sideEffect(css => {
          sink([
            "dom-assert",
            styles_id,
            {
              type: "is",
              expr: { element: "style", attributes: {}, children: [css] },
            },
          ]);
        })
      )
      .subscribe({
        error(error) {
          console.error("ERROR IN SPACE STREAM", error);
        },
      });

    const streams = { ticker, nodes, forces };

    return { streams, sim };
  };

  // Things you still don't have here:
  //
  // - Input source:
  //   - a model
  //     - an RDFTripleStore
  //
  // - listeners to the subjects in the model
  //
  // - representation of model subjects
  //   - place to get dom assertions
  //   - way to match dom assertions
  //   - compute: aggregate dom assertions into templates
  //
  // set up dataflow to listen to rule source changes
  // create graph (if not dataset) to represent model
  //
  // If something is a space, then create a manager/process object for it
  const box_id = id => ({
    id,
    x: Math.random() * 1000 - 500,
    y: Math.random() * 1000 - 500,
  });

  const types = {
    Panel: {},
    XAxis: { dom: [{ matches: '[data-axis="x"]' }] },
    YAxis: { dom: [{ matches: '[data-axis="y"]' }] },
    Space: {
      styles: {},
      "x-axis": { a: "XAxis" },
      "y-axis": { a: "YAxis" },
    },
  };

  function* make(spec, sink, path = []) {
    const { a, ...props } = spec;

    const id = path.join(".");

    yield* [
      ["dom-assert", id, { type: "attribute-equals", name: "id", value: id }],
      [
        "dom-assert",
        id,
        {
          type: "attribute-equals",
          name: "data-local-name",
          value: path[path.length - 1],
        },
      ],
    ];

    // Type is the first line of defense
    if (a) {
      yield [
        "dom-assert",
        id,
        { type: "attribute-equals", name: "typeof", value: a },
      ];

      const type_spec = types[a];
      if (!type_spec) {
        console.warn("I don't know about this type of thing:", a);
      } else {
        // There should be multiple types, and types are live mixins
        // basically prototypes but with protocol composition
        // prototype_props = type_spec;
      }
    } else {
      console.warn("no type in:", ...path, spec);
    }

    for (const [name, child_spec] of Object.entries(props)) {
      const child_path = [...path, name].join(".");
      yield ["dom-assert", id, { type: "contains", id: child_path }];
      yield* make(child_spec, sink, [...path, name]);
    }

    if (a === "Space") {
      const names = Object.keys(props);
      const nodes = names.map(box_id);
      const space = make_space({ id, sink });
      yield ["new-space", id, space];
      const { streams } = space;
      streams.nodes.next(nodes);
    }
  }

  function main() {
    const root = document.getElementById("August-2020-space");

    const dom_process = dp.make_dom_process();
    dom_process.mounted.next({ id: "world", element: root });

    const spec_1 = {
      a: "Panel",
      space1: {
        a: "Space",
        // styles: {},
        Alice: {
          a: "Space",
          // styles: {},
          Greg: {},
          Jimbo: {},
        },
        Bob: {},
        Carol: {},
      },
      space2: { a: "Space", Dave: {}, Edie: {}, Frank: {} },
      space3: { a: "Space", Joe: {}, Al: {}, Sue: {} },
    };

    const dom_claims = {};
    const node_streams = {};
    const sims = {};

    function sink([tag, ...args]) {
      if (tag === "dom-assert") {
        const [id, claim] = args;
        if (claim.type === "is") {
          dom_claims[id] = [claim];
        } else {
          // FF actually runs this
          // (dom_claims[id] ??= []).push(claim);
          if (!dom_claims[id]) dom_claims[id] = [];
          dom_claims[id].push(claim);
        }
        // Could create a stream from this
        dom_process.define(id, operations_to_template(dom_claims[id]));
      } else if (tag === "new-space") {
        const [id, space] = args;
        console.log("new space", id, space);
        const { streams, sim } = space;
        const { ticker, nodes } = streams;
        node_streams[id] = nodes;
        sims[id] = sim;
        // remember all this
      } else {
        console.warn("no handler for", tag);
      }
    }

    for (const claim of make(spec_1, sink, ["world"])) sink(claim);

    const more_names = "Joey Gary Eddie Susan Leo Sadie Sally Betty Freddie".split(
      " "
    );

    rs.fromIterable(more_names, { delay: 1000 }).subscribe({
      next(name) {
        const spec = { a: "Person" };
        const space_name = "space2";
        const container_id = `world.${space_name}`;
        const id = `${container_id}.${name}`;

        for (const claim of make(spec, sink, ["world", "space2", name]))
          sink(claim);
        sink(["dom-assert", container_id, { type: "contains", id }]);

        // const [, any] = Object.keys(node_streams);
        const node_stream = node_streams[container_id];
        if (node_stream) {
          const nodes = node_stream.deref();
          if (nodes) {
            nodes.push(box_id(name));
            node_stream.next(nodes);
            console.log({ id, nodes });
            sims[container_id]?.alpha(1);
          }
        }
      },
    });

    const mouse_moves = rs.fromEvent(document.body, "mousemove");
    // mouse_moves.transform(tx.trace("fbalsdf"));
  }

  main();
});
