define([
  "d3-force",
  "@thi.ng/rstream",
  "@thi.ng/transducers",
  "@def.codes/dom-rules",
  "@def.codes/hdom-regions",
  "./examples/index.js",
], (d3, rs, tx, dom_rules, dp, examples) => {
  // console.log(`examples`, examples);

  const meld = new Proxy({}, {});
  const { css } = meld;

  const { facts_to_operations, operations_to_template } = dom_rules;

  const has_type = (thing, type) =>
    thing.a === type || (Array.isArray(thing.a) && thing.a.includes(type));

  const trap_map = () => {
    const map = new Map();
    const has = key => map.has(key);
    const get = key => map.get(key);
    const set = (key, value) => map.set(key, value);
    return { has, get, set };
  };

  const random_point = () => ({
    x: Math.random() * 1000 - 500,
    y: Math.random() * 1000 - 500,
  });

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

  const make_space = spec => {
    const { id: space_id, sink } = spec;
    const sim = d3.forceSimulation().stop();
    const ticker = rs.subscription();
    const nodes = rs.subscription({ next: sim.nodes });
    // const forces = rs.subscription({ next() {} });

    // ugh another one-time init
    const force_specs = spec["d3:forces"];
    if (force_specs) {
      console.log(`yay we got`, force_specs);

      for (const [force_name, force_spec] of Object.entries(force_specs)) {
        const force_type = force_spec.a.replace(/^d3:/, "");
        if (typeof d3[force_type] !== "function") {
          console.warn(`no such force type: ${force_type}`);
          return;
        }
        const instance = d3[force_type]();
        sim.force(force_name, instance);

        for (const [param, value_expr] of Object.entries(force_spec)) {
          const setter = instance[param];

          if (typeof setter !== "function") {
            console.warn(`skipping: no such param ${param} on ${force_type}`);
            continue;
          }
          console.log(`set ${param} to`, value_expr);
          setter(value_expr);
        }
      }
    }

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

    ticker.transform(
      tx.sideEffect(() => sim.tick()),
      tx.map(() => sim.nodes())
      // tx.sideEffect(nodes => console.log("WUUT", ...nodes))
    );

    const styles_id = `${space_id}.xy-styles`;
    // What you really want is a css assert
    // But (very) non-monotonic
    // Update-in-place, "non-knowledge"
    sink(["dom-assert", space_id, { type: "contains", id: styles_id }]);
    sink(["dom-assert", styles_id, { type: "uses-element", name: "style" }]);

    ticker
      .transform(
        tx.map(nodes => {
          const css = sim
            .nodes()
            .map(_ => {
              const id = `${space_id}.${_.id}`;
              return `
[id="${id}"], [data-x-source="${id}"] { --x:${_.x.toFixed(1)}; }
[id="${id}"], [data-y-source="${id}"] { --y:${-_.y.toFixed(1)}; }
[id="${id}"], [data-vx-source="${id}"] { --vx:${_.vx.toFixed(1)}; }
[id="${id}"], [data-vy-source="${id}"] { --vy:${-_.vy.toFixed(1)}; }
`;
            })
            .join("\n");

          return css;
        }),
        tx.sideEffect(css => {
          sink(["dom-assert", styles_id, { type: "text-is", text: css }]);
        })
      )
      .subscribe({
        error(error) {
          console.error("ERROR IN SPACE STREAM", error);
        },
      });

    // Alpha updates on every frame.  This really should be a stream.  There's
    // no reason to create it if there aren't any subscribers.
    const alpha = ticker.transform(tx.map(() => sim.alpha()));

    const streams = { ticker, nodes, alpha };

    return { streams, sim };
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
  //   - place to get dom assertions (DONE: allow as “global” message)
  //   - way to match dom assertions (DONE: they must identify a subject)
  //   - compute: aggregate dom assertions into templates (DONE)
  //
  // set up dataflow to listen to rule source changes
  // create graph (if not dataset) to represent model
  //
  // If something is a space, then create a manager/process object for it

  const TYPES = {
    Sequence: {
      comment:
        "runtime has `Iterable` protocol.  Turtle has list syntax; RDF otherwise strictly unordered",
    },
    Queue: {
      comment:
        "well-known interface.  can has transducer.  async, blocking read/write.",
    },
    "d3:forceManyBody": {},
    "d3:forceX": {},
    "d3:forceY": {},
    WindowingBuffer: {},
    FixedBuffer: { subclassOf: "WindowingBuffer" },
    SlidingBuffer: { subclassOf: "WindowingBuffer" },
    Panel: {},
    XAxis: { dom: [{ matches: '[data-axis="x"]' }] },
    YAxis: { dom: [{ matches: '[data-axis="y"]' }] },
    Person: {
      name: "",
    },
    [meld.d3]: {},
    Collection: {},
    Simulation: {},
    ForceManyBody: {},
    Map: {},
    Stream: {},
    Runner: { comment: "something that runs about" },
    Counter: { comment: "monotonic increment (source, sync, proc)" },
    Sink: {},
    Source: {},
    StreamSync: { subclassOf: "Stream" },
    Space: {
      styles: {},
      "x-axis": { a: "XAxis" },
      "y-axis": { a: "YAxis" },
    },
  };

  const rules = [
    {
      // This is currently being done via some hardcoding using the css var --simulation-alpha
      // in concert with a static rule in space.css
      comment: "simulation alpha.  good for heat map",
      when: ["?x a d3?ForceSimulation"],
      then: {},
    },
    {
      comment: "a buffer can indicate its cardinality with dots",
      when: ["?x a Buffer"],
      then: {
        /* there exist |buffer| dots in the buffer's representation */
        /* as distributed as possible, so you can see the count  */
      },
    },
  ];

  function* scan(spec, sink, path = []) {
    if (typeof spec !== "object") {
      // console.warn(`spec of type ${typeof spec} is not supported! ${spec}`);
      return;
    }

    if (Array.isArray(spec)) {
      let i = 0;
      for (const item of spec) yield* scan(item, sink, [...path, i++]);
      return;
    }

    const { a, ...props } = spec;

    const id = path.join(".");
    const name = path[path.length - 1];
    // Would rather something like
    // return { dom: { matches: `[id="${id}"]` } };
    // return { dom: { matches: `[name="${name}"]` } };
    yield* [
      ["dom-assert", id, { type: "attribute-equals", name: "id", value: id }],
      [
        "dom-assert",
        id,
        { type: "attribute-equals", name: "name", value: name },
      ],
    ];

    // Type is the first line of defense
    if (a) {
      if (Array.isArray(a))
        for (const type of a) yield ["assert-type", id, type];
      else yield ["assert-type", id, a];
    } else {
      console.warn("no type in:", ...path, spec);
    }

    for (const [name, child_spec] of Object.entries(props)) {
      const child_path = [...path, name].join(".");
      yield ["dom-assert", id, { type: "contains", id: child_path }];
      yield* scan(child_spec, sink, [...path, name]);
    }

    if (has_type(spec, "Counter")) {
      // well then
      const counter = rs.fromInterval(500);
      // where does the energy come from?
      // the counter can be pull (lazy, non-strict), this is not about time, right?
      const counter_id = [...path, "counter:Process"].join(".");
      yield ["dom-assert", id, { type: "contains", id: counter_id }];
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

    // If it's a space, call Space's elaborate init routine
    if (has_type(spec, "Space")) {
      // This mapping creates a new object that uses
      // force parameter initializer functions can still read itsthe nodes at-large
      // properties.
      const nodes = Object.entries(props).map(([id, node]) =>
        box_simulation_node(node, id)
      );
      const space = make_space({ id, sink });
      yield ["new-space", id, space];
      const { streams } = space;
      streams.nodes.next(nodes);
    }
  }

  function main() {
    const root = document.getElementById("August-2020-space");

    const dom_process = dp.make_dom_process();
    dom_process.mounted.next({ id: "world", element: root });

    const EXAMPLE = {
      a: "Panel",
      pane1: {
        a: "Space",
        ["d3:forces"]: {
          // But expressions could go in place of the constants
          charge: { a: "d3:forceManyBody", strength: 2000 },
          "x-axis": { a: "d3:forceX", x: 0, strength: 0.01 },
          "y-axis": { a: "d3:forceY", x: 0, strength: 0.01 },
          others() {
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
          },
        },
        What: define, // {},
      },
      pane2: {
        a: "Space",
        Sherry: { a: "Woman" },
        Sue: { a: "Woman" },
        dataflow: {
          // What this would actually be.... not you writing out all of the things, but
          // you're creating a view, a container, and you would describe the things that
          // should be included in this space.  with various kinds of matching at your disposal
          a: "Space",
          Billy: { a: "Person" },
          Nellie: { a: "Person" },
          // things: {
          //   a: "Space",
          //   // a: "Collection",
          //   sim1: { a: "Simulation" },
          //   trace_me: { a: "Runner", x: { a: "Counter" }, y: {} },
          // },
        },
        foo: {
          a: "Space",
          forces: {
            a: "Map",
            charge: {
              comment: "causes things to repel each other",
              a: "ForceManyBody",
              strength: 1, // "expression goeth here",
              // Could be a constant expression
              // Could be a source description
              // Could be a function (of the node)
              // Could be a source that emits functions?
            },
          },
          dataflow: {
            assertions: {
              a: "StreamSync",
              comment: "coordinate all dom assertions about representations",
            },
            [meld.dom_sink]: { a: "Sink" },
            step: {
              a: ["Source", "Counter"],
              comment:
                "the simulation does not schedule itself.  for best results, feed it at regular intervals",
              transforms_with: [["map", () => sim.tick()]],
            },
            css: {
              a: "Sink",
              comment:
                "map variable assignments from simulation nodes to css.  could be done via writing dom nodes with serialized style rules, or possibly by direct manipulation of host interfaces representing those rules.  I'm assuming there's some difference in overhead.",
              listens_to: { id: "step" },
              transforms_with: [
                [
                  "map",
                  bodies =>
                    bodies.map(
                      _ =>
                        css.rules(
                          ...["x", "y", "vx", "vy"].map(
                            v => [
                              `[id="${_.id}"]`,
                              `[data-${v}-source]`,
                              { [`--${v}`]: _[v]?.toFixed(1) },
                            ],
                            []
                          )
                        ),
                      // “Unrolled” version (which lumps all together)
                      // Name might not be a legal ID
                      css.rule([`[id="${_.id}"]`, "[]"], {
                        "--x": _.x,
                        "--y": _.y,
                        "--vx": _.vx,
                        "--vy": _.vy,
                      })
                    ),
                ],
              ],
            },

            // D3 has some of its own internal dataflow
            // each time a force definition is updated
            // the force values have to be recomputed
          },
        },
        space1: {
          // Space is a way of viewing something, not (always) the thing itself
          a: "Space",
          SomeGroup: {
            a: "Space",
            Greg: { a: "Person" },
            Jimbo: { a: "Person" },
            Johnson: {
              a: "Space",
              Fred: { a: "Person" },
              Bob: { a: "Person" },
            },
          },
          Bob: { a: "Person" },
          Carol: { a: "Person" },
        },
        space2: {
          a: "Space",
          Dave: { a: "Person" },
          Edie: { a: "Person" },
          Frank: { a: "Person" },
        },
        space3: {
          a: "Space",
          Joe: { a: "Person" },
          Al: { a: "Person" },
          Sue: { a: "Person" },
        },
      },
    };
    const spec_1 = EXAMPLE;

    const dom_claims = {};
    const node_streams = {};
    const sims = {};

    const by_id = trap_map();
    const by_type = trap_map();

    function sink([tag, ...args]) {
      if (tag === "dom-assert") {
        const [id, claim] = args;
        if (claim.type === "is") {
          dom_claims[id] = [claim];
        } else {
          // FF actually runs this
          // (dom_claims[id] ??= []).push(claim);
          if (!dom_claims[id]) dom_claims[id] = [];
          dom_claims[id].push(claim);
        }
        // Could create a stream from this
        dom_process.define(id, operations_to_template(dom_claims[id]));
      } else if (tag === "css-assert") {
        try {
          const [claimant, selector, properties] = args;
          const css = `${selector} {
${Object.entries(properties)
  .map(([key, value]) => `${key}:${value};`)
  .join("\n")}
}`;
          // The first two of these don't need to be done each time on each assert
          const ass_id = `${claimant}.css-assertions`;
          sink(["dom-assert", claimant, { type: "contains", id: ass_id }]);
          sink(["dom-assert", ass_id, { type: "uses-element", name: "style" }]);
          sink(["dom-assert", ass_id, { type: "text-is", text: css }]);
        } catch (error) {
          console.log("Problem processing CSS assert");
        }
      } else if (tag === "assert-type") {
        const [id, type] = args;
        if (!type) throw new Error(`type assertion missing object`);

        // Special index by type
        // Again... this could be a subscriber
        // What do you do with this, anyway?
        // Maybe visit all instances when a prototype is updated
        if (!by_type.has(type)) by_type.set(type, new Set());
        by_type.get(type).add(id);

        const type_spec = TYPES[type];
        if (!type_spec) {
          console.warn("I don't know about this type of thing:", type);
        } else {
          // There should be multiple types, and types are live mixins
          // basically prototypes but with protocol composition
          // prototype_props = type_spec;
        }

        // This is a general rule.
        //
        // Emit this anyway because CSS rules might know about it
        //
        // ?x a ?t . ?e represents ?x -> ?e typeof contains ?t
        //
        // Non-monotonic: if this is retracted, the assertions need to be
        // recomputed.  The assertions are downstream from the type definitions
        // and upstream from the dom templates.

        // Should subscribe to the by-type map...
        // Also how do we feel about sinking from here?
        // Would rather say
        //
        // sink(["dom-assert", { id, matches: `[typeof~="${type}"]` }]);
        sink([
          "dom-assert",
          id,
          { type: "attribute-contains-word", name: "typeof", value: type },
        ]);
      } else if (tag === "new-space") {
        const [id, space] = args;
        const { streams, sim } = space;
        const { ticker, nodes, alpha } = streams;
        node_streams[id] = nodes;
        sims[id] = sim;
        // actually start the simulation
        // rs.fromInterval(1000).subscribe(ticker);
        const forcefield_energy_source = rs.fromRAF();
        forcefield_energy_source.subscribe(ticker);
        alpha.transform(
          // Remember, this threshold is itself a var, i.e. this is a sync node
          // so yeah you can't have any constant, you really need to understand these exprs
          // but how do you do arbitrary, stateful, side-effecting lambdas?
          // yeah and why??
          tx.filter(a => a < 0.1),
          tx.sideEffect(() => forcefield_energy_source.done())
        );
        alpha.subscribe({
          done(value) {
            // Yep, it stops when reaching alpha target
            console.log("DONE", id, value);
            // What is the disposition of a dead process?  disposal
          },
          next(value) {
            sink([
              "css-assert",
              id,
              `[id="${id}"], [data-simulation-alpha-source="${id}"]`,
              { "--simulation-alpha": value.toFixed(2) },
            ]);
          },
        });
        // remember all this
      } else {
        console.warn("no handler for", tag);
      }
    }

    for (const claim of scan(spec_1, sink, ["world"])) sink(claim);

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

    const mouse_moves = rs.fromEvent(document.body, "mousemove");
    // mouse_moves.transform(tx.trace("fbalsdf"));
  }

  main();
});
