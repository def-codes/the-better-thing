let dragging = null;
rs.fromEvent(container, "mousedown").transform(
  tx.sideEffect(event => {
    event.preventDefault();
    dragging = null;
    const { target } = event;
    const id = target.getAttribute("data-node");
    if (!id) return;
    const node = nodes[id];
    if (!node) return;
    node.dragging = true;
    dragging = {
      node,
      box: event.currentTarget.getBoundingClientRect()
    };
  })
);
rs.fromEvent(container, "mousemove").transform(
  tx.sideEffect(event => {
    event.preventDefault();
    if (!dragging) return;
    dragging.node.x = event.x - dragging.box.x;
    dragging.node.y = event.y - dragging.box.y;
    sim.restart();
    tick_driver.next();
  })
);
rs.fromEvent(container, "mouseup").transform(
  tx.sideEffect(event => {
    if (dragging) delete dragging.node.dragging;
    dragging = null;
    event.preventDefault();
  })
);
rs.fromEvent(container, "mouseleave").transform(
  tx.sideEffect(event => {
    if (dragging) delete dragging.node.dragging;
    dragging = null;
  })
);
