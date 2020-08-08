define([], () => {
  const DEFAULT_FORCES = {
    // But expressions could go in place of the (parameter) constants
    charge: { a: "d3:forceManyBody" },
    "x-axis": { a: "d3:forceX", x: 0, strength: 0.01 },
    "y-axis": { a: "d3:forceY", y: 0, strength: 0.01 },
  };

  const RECIPE = {
    a: ["Fullscreen", "Panel"],
    alpha: {
      a: ["Space"],
      "d3:forces": { temp: { a: "d3:forceX", x: 250 } },
      ball: { a: "Thing" },
    },
    views: {
      a: "Panel",
      pane1: {
        a: "Space",
        ["d3:forces"]: {
          // View the default forces in a space using the default forces
          // a: "Space",
          // ["d3:forces"]: DEFAULT_FORCES,
          ...DEFAULT_FORCES,
        },
        What: {},
        Define: {},
        Require: {},
      },
      pane2: {
        a: ["Table", "Space"],
        ["d3:forces"]: DEFAULT_FORCES,
        Sherry: { a: "Woman" },
        Sue: { a: "Woman" },
        dataflow: {
          // What this would actually be.... not you writing out all of the things, but
          // you're creating a view, a container, and you would describe the things that
          // should be included in this space.  with various kinds of matching at your disposal
          a: "Space",
          ["d3:forces"]: {
            charge: { a: "d3:forceManyBody" },
            "x-axis": { a: "d3:forceX", x: 0, strength: 0.01 },
            "y-axis": { a: "d3:forceY", y: 0, strength: 0.01 },
          },
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
          ["d3:forces"]: DEFAULT_FORCES,
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
            "meld:domSink": { a: "Sink" },
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
    },
  };
  return { RECIPE };
});
