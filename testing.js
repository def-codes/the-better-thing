const tx = require("@thi.ng/transducers");
const { Graph, from_facts } = require("@def.codes/graphs");
const { map_object } = require("@def.codes/helpers");
const { display } = require("@def.codes/node-web-presentation");
const dot = require("@def.codes/graphviz-format");

let count = 0;
const nextid = () => `n${count++}`;

const walker_state = dot.empty_traversal_state();
const options = { state: walker_state };

// a graph mapping that prepends the given string to each id in a graph stream.
// but you end up seeing this as the key.  rather want to see the label
const prefix_keys = prefix =>
  map_object((value, key) =>
    key === "subject" || key === "object" ? `${prefix}${value}` : value
  );

//////////////////////// for module
function* pipeline(fns, val) {
  let acc = val;
  for (const fn of fns) yield [fn, (acc = fn(acc))];
}
function* view_pipeline(input, results) {
  yield Object.assign(dot.object_graph_to_dot_subgraph([{ input }], options), {
    id: `cluster_${nextid()}`,
    attributes: { label: "input" },
  });
  for (const [fn, acc] of results) {
    const id = nextid();
    const label = fn.name || id;
    // still using this for now
    yield Object.assign(dot.object_graph_to_dot_subgraph([acc], options), {
      id: `cluster_${id}`,
      attributes: { label },
    });
  }
}
/////////////////////

const graph = dot.graph({
  directed: true,
  attributes: {
    // rankdir: "LR"
  },
  statements: [
    ...view_pipeline({ hello: "world" }, [
      ...pipeline(
        [
          function box(value) {
            return { value };
          },
          function enumerate(value) {
            return Object.entries(value);
          },
        ],
        { hello: "world" }
      ),
    ]),
  ],
});

display(graph);
