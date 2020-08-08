define(["d3-force"], d3 => {
  // see node-provenance.md
  const box_simulation_node = (node, id) => {
    // for hidden classes, ensure that objects have a uniform structure.
    const { x, y, vx, vy } = node;
    return Object.create(node, {
      id: { value: id },
      x: { writable: true, value: typeof x === "number" ? x : 0 },
      y: { writable: true, value: typeof y === "number" ? y : 0 },
      vx: { writable: true, value: typeof vx === "number" ? vx : 0 },
      vy: { writable: true, value: typeof vy === "number" ? vy : 0 },
    });
  };

  const force_from_description = force_spec => {
    const force_type = force_spec.a.replace(/^d3:/, "");

    if (typeof d3[force_type] !== "function") {
      console.warn(`no such force type: ${force_type}`);
      return;
    }

    const instance = d3[force_type]();

    for (const [param, value_expr] of Object.entries(force_spec)) {
      // skip type indicator
      if (param !== "a") {
        if (typeof instance[param] === "function") {
          instance[param](value_expr);
        } else {
          console.warn(`skipping: no such param ${param} on ${force_type}`);
        }
      }
    }

    return instance;
  };

  return { box_simulation_node, force_from_description };
});
