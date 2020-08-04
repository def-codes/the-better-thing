define([
  "d3-force",
  "@thi.ng/rstream",
  "@thi.ng/transducers",
  "@def.codes/dom-rules",
  "@def.codes/hdom-regions",
], (d3, rs, tx, dom_rules, dp) => {
  const { facts_to_operations, operations_to_template } = dom_rules;

  const make_space = spec => {
    const { id, dom_process } = spec;
    const sim = d3.forceSimulation().stop();
    const nodes = rs.subscription({ next: sim.nodes });
    const forces = rs.subscription({ next() {} });

    // Default forces (just for testing)
    sim.force("x-axis", d3.forceX(0));
    sim.force("y-axis", d3.forceY(0));
    sim.force("center", d3.forceCenter());
    sim.force("charge", d3.forceManyBody());

    // const ticker = rs.fromInterval(150)
    rs.fromInterval(1000).subscribe({ next: () => sim.restart() });
    const ticker = rs.fromRAF().transform(
      tx.sideEffect(() => sim.tick()),
      tx.map(() => sim.nodes())
    );
    ticker.subscribe({
      next: css => {
        // Update all positions
        dom_process.define(`${id} styles`, {
          element: "style",
          attributes: {},
          children: [
            sim
              .nodes()
              .map(
                _ =>
                  `#${_.id}{` +
                  `--x:${Math.round(_.x)};--y:${Math.round(_.y)};` +
                  `--fx:${Math.round(_.fx)};--fy:${Math.round(_.fy)};` +
                  `--vx:${Math.round(_.vx)};--fy:${Math.round(_.vy)}}`
              )
              .join("\n"),
          ],
        });
      },
    });

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
    x: Math.random() * 1000,
    y: Math.random() * 1000,
  });

  function main() {
    const root = document.getElementById("August-2020-space");

    const dom_process = dp.make_dom_process();
    dom_process.mounted.next({ id: "root", element: root });

    const spaces = {
      space1: { names: "Alice Bob Carol".split(" ") },
      space2: { names: "Dave Edie Frank".split(" ") },
      space3: { names: "Joe Al Sue".split(" ") },
    };
    const space_entries = Object.entries(spaces);

    dom_process.define(
      "root",
      operations_to_template([
        { type: "attribute-contains-word", name: "class", value: "panels" },
        ...space_entries.map(([id]) => ({ type: "contains", id })),
      ])
    );

    for (const [space, { names }] of space_entries) {
      dom_process.define(
        space,
        operations_to_template([
          { type: "attribute-equals", name: "typeof", value: "Space" },
          { type: "contains", id: `${space} styles` },
          ...names.map(id => ({ type: "contains", id })),
        ])
      );
      for (const name of names)
        dom_process.define(
          name,
          operations_to_template([
            { type: "uses-element", name: "b" },
            { type: "attribute-equals", name: "id", value: name },
            {
              type: "contains-text",
              text: `My name is ${name.toUpperCase()} fool!`,
            },
          ])
        );

      const { streams } = make_space({ dom_process, id: space });
      // const { ticker, nodes, forces } = streams;
      streams.nodes.next(names.map(box_id));
    }
  }

  main();
});
