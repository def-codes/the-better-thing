define(["d3-force", "@thi.ng/rstream", "@thi.ng/transducers"], (d3, rs, tx) => {
  console.log("FORCE", d3);

  const make_space = spec => {
    const { root } = spec;
    const sim = d3.forceSimulation().stop();
    const nodes = rs.subscription({ next: sim.nodes });
    const forces = rs.subscription({
      next() {
        // diff forces description... but just... why
      },
    });

    // Add a style element that we'll maintain the old fashioned way
    const style_node = root.appendChild(document.createElement("style"));

    const frame = () => {
      // Update all positions
      style_node.innerHTML = sim
        .nodes()
        .map(
          _ => `#${_.id} {top:${Math.round(_.y)}px; left:${Math.round(_.x)}px;}`
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

  function main() {
    const root = document.getElementById("August-2020-space");
    const { streams } = make_space({ root });
    const { ticker, nodes, forces } = streams;
    const EXAMPLE_NODES = [{ id: "Alice" }, { id: "Bob" }, { id: "Carol" }];
    nodes.next(EXAMPLE_NODES);
  }

  main();
});
