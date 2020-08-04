define([
  "d3-force",
  "@thi.ng/rstream",
  "@thi.ng/transducers",
  "@def.codes/dom-rules",
  "@def.codes/hdom-regions",
], (d3, rs, tx, dom_rules, dp) => {
  const { facts_to_operations, operations_to_template } = dom_rules;

  const make_space = spec => {
    const { root, dom_process } = spec;
    const sim = d3.forceSimulation().stop();
    const nodes = rs.subscription({ next: sim.nodes });
    const forces = rs.subscription({ next() {} });

    // Add a style element that we'll maintain the old fashioned way
    const style_node = root.appendChild(document.createElement("style"));

    const frame = () => {
      // Update all positions
      style_node.innerHTML = sim
        .nodes()
        .map(
          _ =>
            `#${_.id}{` +
            `--x:${Math.round(_.x)};--y:${Math.round(_.y)};` +
            `--fx:${Math.round(_.fx)};--fy:${Math.round(_.fy)};` +
            `--vx:${Math.round(_.vx)};--fy:${Math.round(_.vy)}}`
        )
        .join("\n");
    };

    // Default forces (just for testing)
    sim.force("center", d3.forceCenter());
    sim.force("charge", d3.forceManyBody());

    const ticker = rs.fromInterval(100).transform(
      tx.sideEffect(() => sim.tick()),
      tx.map(() => sim.nodes())
    );
    ticker.subscribe({ next: frame });

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

  function main() {
    const root = document.getElementById("August-2020-space");
    const dom_process = dp.make_dom_process();
    console.log(`dom_process`, dom_process);
    dom_process.mounted.next({ id: "root", element: root });

    const some_operations = [
      { type: "contains-text", text: "formidable nightmares" },
      { type: "uses-element", name: "i" },
    ];
    const template = operations_to_template(some_operations);

    dom_process.define("alien", {
      element: "i",
      attributes: {},
      children: [
        "invaaaasion!",
        { element: "placeholder", attributes: { id: "spook" }, children: [] },
      ],
    });
    dom_process.define("species", template);
    dom_process.define("root", {
      element: "b",
      attributes: {},
      children: [
        "foo",
        { element: "placeholder", attributes: { id: "alien" }, children: [] },
        { element: "placeholder", attributes: { id: "species" }, children: [] },
        "bar",
      ],
    });

    const { streams } = make_space({ root, dom_process });
    const { ticker, nodes, forces } = streams;
    const EXAMPLE_NODES = [{ id: "Alice" }, { id: "Bob" }, { id: "Carol" }];
    nodes.next(EXAMPLE_NODES);
  }

  main();
});
