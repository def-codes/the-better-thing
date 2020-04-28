define(["d3-force", "@thi.ng/rstream", "@thi.ng/transducers"], async (
  d3,
  rs,
  tx
) => {
  const init = () => {
    const ff = d3.forceSimulation();
    const fx = d3.forceX(250).strength(0.01);
    const ot = { id: "temperature", x: 0 };
    const _nodes = [ot];
    ff.nodes(_nodes);
    ff.force("controller", fx);
    const nodes = rs.stream();
    const tick = () => {
      ff.tick();
      nodes.next(_nodes);
    };
    return { tick, nodes };
  };
  const { tick, nodes } = init();

  rs.fromInterval(150).subscribe({ next: tick });
  // rs.fromRAF().subscribe({ next: tick });
  // But how do you know which node index?
  //nodes.transform(tx.pluck(0), tx.pluck("x")).subscribe(rs.trace("nodes"));
});
