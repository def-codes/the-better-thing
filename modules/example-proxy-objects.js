const example_proxy_object = {
  Oven: {
    current_temp: {
      a: "rs:Stream",
      // reacts_to: heat_source.map(x => x * 2).filter(x => x % 2),
      reacts_to: heat_source.map(x => x * 2).filter(x => x % 2),
      label: "°",
    },
    heat_source: { a: "d3:XForce", x: target_temp },
    // target_temp is unresolved...
    // so nothing happens.  but when used here, it's understood as a name to resolve against model
    // when it is defined (and defined as a stream) it should serve as the source for x
    door: {
      open: false,
      $style: {},
      $forces: {},
    },
  },
  oven: { a: "Oven" },
  Egg: {},
  eggs: {
    a: "Bag",
    of: "Egg",
  },
};
