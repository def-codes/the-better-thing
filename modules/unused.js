// Things you still don't have here:
//
// - Input source:
//   - a model
//     - an RDFTripleStore
//
// - listeners to the subjects in the model
//
// - representation of model subjects
//   - place to get dom assertions (DONE: allow as “global” message)
//   - way to match dom assertions (DONE: they must identify a subject)
//   - compute: aggregate dom assertions into templates (DONE)
//
// set up dataflow to listen to rule source changes
// create graph (if not dataset) to represent model
//
// If something is a space, then create a manager/process object for it

// temp: periodically (disturb nodes and) re-warm alpha
// rs.fromInterval(5000).subscribe({
//   next: () => {
//     for (const node of sim.nodes()) {
//       node.x = Math.random() * 1000 - 500;
//       node.y = Math.random() * 1000 - 500;
//     }
//     sim.alpha(1);
//   },
// });

const other_forces_unused = () => {
  // sim.force("center", d3.forceCenter());

  // sim.force(
  //   "stronger",
  //   d3.forceX(250).strength(node => {
  //     const ret = has_type(node, "Space") ? 0 : 0.25;
  //     console.log("Assessing strength", ret, "for node", node);
  //     return ret;
  //   })
  // );

  if (false)
    sim.force(
      "pull non-spaces to right",
      d3.forceX(250).strength(node => {
        const ret = has_type(node, "Space") ? 0 : 0.25;
        console.log("Assessing strength", ret, "for node", node);
        return ret;
      })
    );
};

function add_more_nodes_somewhere() {
  const more_names = "Joey Gary Eddie Susan Leo Sadie Sally Betty Freddie".split(
    " "
  );

  rs.fromIterable(more_names, { delay: 1000 }).subscribe({
    next(name) {
      const spec = { a: "Person" };
      const container_path = [`world`, "dataflow"];
      const new_thing_path = [...container_path, name];
      const container_id = container_path.join(".");
      const id = new_thing_path.join(".");

      for (const claim of scan(spec, sink, new_thing_path)) sink(claim);
      sink(["dom-assert", container_id, { type: "contains", id }]);
      // sink([
      //   "dom-assert",
      //   id,
      //   { type: "contains-text", text: `my name is ${name}!` },
      // ]);

      const node_stream = node_streams[container_id];
      if (node_stream) {
        const nodes = node_stream.deref();
        if (nodes) {
          nodes.push(box_simulation_node(random_point(), name));
          // Let d3 mutate this I guess?
          //nodes.push({ id: name });
          node_stream.next(nodes);
          sims[container_id]?.alpha(1);
        } else {
          console.warn(`No cached nodes for ${container_id}!`);
        }
      } else {
        console.warn(`No node stream for ${container_id}!`);
      }
    },
  });
}
alpha.subscribe({
  done(value) {
    // Yep, it stops when reaching alpha target
    // console.log("DONE", id, value);
    // What is the disposition of a dead process?  disposal
  },
});

// Special index by type
// Again... this could be a subscriber
// What do you do with this, anyway?
// Maybe visit all instances when a prototype is updated
const by_type = trap_map();
// ...
if (!by_type.has(type)) by_type.set(type, new Set());
by_type.get(type).add(id);

const datafy_mouse_event = _ => {
  return {
    type: "https://www.w3.org/TR/uievents/#mouseevent",
    timestamp: _.timeStamp,
    x: _.clientX,
    y: _.clientY,
    movementX: _.movementX,
    movementY: _.movementY,
    button: _.button,
    ctrlKey: _.ctrlKey,
    shiftKey: _.shiftKey,
    altKey: _.altKey,
    metaKey: _.metaKey,
  };
};

const mouse_moves = rs.fromEvent(document.body, "mousemove");
mouse_moves.transform(
  tx.map(datafy_mouse_event),
  tx.sideEffect(record => {
    // assert this record into the graph
    // console.log("yeay", record);
  })
);

function* scan_frag() {
  if (has_type(spec, "Counter")) {
    // well then
    const counter = rs.fromInterval(500);
    // where does the energy come from?
    // the counter can be pull (lazy, non-strict), this is not about time, right?
    const counter_id = [...path, "counter:Process"].join(".");
    yield [("dom-assert", id, { type: "contains", id: counter_id })];
    counter.subscribe({
      next(value) {
        sink([
          "dom-assert",
          counter_id,
          { type: "text-is", text: `${value}!` },
        ]);
      },
    });
    // What does the recipe say about when this thing dies?
  }
}
