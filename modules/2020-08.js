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

    // Add a style element that we'll maintain the old fashioned way
    // const style_node = root.appendChild(document.createElement("style"));
    // dom_process.port();

    const frame = () => {
      const css = sim
        .nodes()
        .map(
          _ =>
            `#${_.id}{` +
            `--x:${Math.round(_.x)};--y:${Math.round(_.y)};` +
            `--fx:${Math.round(_.fx)};--fy:${Math.round(_.fy)};` +
            `--vx:${Math.round(_.vx)};--fy:${Math.round(_.vy)}}`
        )
        .join("\n");
      // Update all positions
      dom_process.define(`${id} styles`, {
        element: "style",
        attributes: {},
        children: [css],
      });

      // style_node.innerHTML =
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
    dom_process.mounted.next({ id: "root", element: root });

    /*
    dom_process_1.define("alien", {
      element: "i",
      attributes: {},
      children: [
        "invaaaasion!",
        { element: "placeholder", attributes: { id: "spook" }, children: [] },
      ],
    });
    // dom_process_1.define("species", template);
    dom_process_1.define("root1", {
      element: "b",
      attributes: {},
      children: [
        "foo",
        { element: "placeholder", attributes: { id: "alien" }, children: [] },
        { element: "placeholder", attributes: { id: "species" }, children: [] },
        "bar",
      ],
    });
	*/
    const names1 = "Alice Bob Carol".split(" ");
    const names2 = "Dave Edie Frank".split(" ");
    dom_process.define(
      "root",
      operations_to_template([
        { type: "attribute-contains-word", name: "class", value: "panels" },
        { type: "contains", id: "space1" },
        { type: "contains", id: "space2" },
      ])
    );
    dom_process.define(
      "space1",
      operations_to_template([
        { type: "attribute-equals", name: "typeof", value: "Space" },
        { type: "contains", id: `space1 styles` },
        ...names1.map(id => ({ type: "contains", id })),
      ])
    );
    dom_process.define(
      "space2",
      operations_to_template([
        { type: "attribute-equals", name: "typeof", value: "Space" },
        { type: "contains", id: `space2 styles` },
        ...names2.map(id => ({ type: "contains", id })),
      ])
    );
    for (const name of [...names1, ...names2])
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

    const one = make_space({ dom_process, id: "space1" });
    const two = make_space({ dom_process, id: "space2" });
    // const { streams } = make_space({ root: root1, dom_process: dom_process_1 });
    // const { ticker, nodes, forces } = streams;
    const box_id = id => ({ id });
    one.streams.nodes.next(names1.map(box_id));
    two.streams.nodes.next(names2.map(box_id));
  }

  main();
});
