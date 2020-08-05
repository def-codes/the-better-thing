define([
  "d3-force",
  "@thi.ng/rstream",
  "@thi.ng/transducers",
  "@def.codes/dom-rules",
  "@def.codes/hdom-regions",
  "./examples/index.js",
], (d3, rs, tx, dom_rules, dp, examples) => {
  console.log(`examples`, examples);

  const { facts_to_operations, operations_to_template } = dom_rules;

  const make_space = spec => {
    const { id, dom_process } = spec;
    const sim = d3.forceSimulation().stop();
    const nodes = rs.subscription({ next: sim.nodes });
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
          node.x = Math.random() * 1000 - 500;
          node.y = Math.random() * 1000 - 500;
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

    ticker.transform(
      tx.map(nodes =>
        nodes
          .map(
            _ =>
              `
#${id}, [data-x-source="${id}"] { --x:${Math.round(_.x)}; }
#${id}, [data-y-source="${id}"] { --y:${Math.round(-_.y)}; }
#${id}, [data-vx-source="${id}"] { --vx:${Math.round(_.vx)}; }
#${id}, [data-vy-source="${id}"] { --vy:${Math.round(-_.vy)}; }
`
          )
          .join("\n")
      ),
      tx.sideEffect(css => {
        // Update all positions
        dom_process.define(`${id}.styles`, {
          element: "style",
          attributes: {},
          children: [css],
        });
      })
    );

    const streams = { ticker, nodes, forces };

    return { streams };
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

  function* make(spec, dom_process, path = []) {
    const { a, ...props } = spec;

    const id = path.join(".");
    let prototype_props = {};

    yield [
      "dom-assert",
      id,
      { type: "attribute-equals", name: "id", value: id },
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
        console.warn("I don't know about this type of thing");
      } else {
        // There should be multiple types, and types are a mixin
        // basically prototypes but with protocol composition
        // prototype_props = type_spec;
      }
    }

    const effective_props = { ...prototype_props, ...props };

    for (const [name, child_spec] of Object.entries(effective_props)) {
      const child_path = [...path, name].join(".");
      yield ["dom-assert", id, { type: "contains", id: child_path }];
      yield* make(child_spec, dom_process, [...path, name]);
    }

    if (a === "Space") {
      const names = Object.keys(props);
      const nodes = names.map(box_id);
      const { streams } = make_space({ id, dom_process });
      console.log(`names, nodes, streams`, names, nodes, streams);
      streams.nodes.next(nodes);
    }
  }

  function main() {
    const root = document.getElementById("August-2020-space");

    const dom_process = dp.make_dom_process();
    dom_process.mounted.next({ id: "root", element: root });

    const spec_1 = {
      a: "Panel",
      space1: { a: "Space", styles: {}, Alice: {}, Bob: {}, Carol: {} },
      space2: { a: "Space", styles: {}, Dave: {}, Edie: {}, Frank: {} },
      space3: { a: "Space", styles: {}, Joe: {}, Al: {}, Sue: {} },
    };

    const dom_claims = {};
    // HACK: passing dom_process for now to get it through to space
    // need a way for its mixin to stream that itself but indirectly
    for (const ass of make(spec_1, dom_process)) {
      const [tag, ...args] = ass;
      if (tag === "dom-assert") {
        const [id, claim] = args;
        if (!dom_claims[id]) dom_claims[id] = [];
        dom_claims[id].push(claim);
      } else {
        console.warn("no handler for", tag);
      }
    }

    dom_process.define(
      "root",
      operations_to_template(
        // Object.keys(dom_claims).map(id => ({ type: "contains", id }))
        // No the keys of the spec
        Object.keys(spec_1).map(id => ({ type: "contains", id }))
      )
    );
    for (const [id, claims] of Object.entries(dom_claims)) {
      dom_process.define(id, operations_to_template(claims));
    }

    // ////////////////////////////////////////////////////////

    const mouse_moves = rs.fromEvent(document.body, "mousemove");
    // mouse_moves.transform(tx.trace("fbalsdf"));
  }

  main();
});
