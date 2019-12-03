const { setIn } = require("@thi.ng/paths");
const { display } = require("@def.codes/node-web-presentation");
const dot = require("@def.codes/graphviz-format");

const names = "john paul george rich".split(" ");
const cities = "Johannesburg London Cairo Alexandria Madrid".split(" ");

let count = 0;
const nextid = () => `n${count++}`;

const walker_state = dot.empty_traversal_state();
const options = { state: walker_state };

const apply = (fn, args, id = nextid()) => {
  const output = fn(...args);
  return Object.assign(
    dot.object_graph_to_dot_subgraph(
      [{ fn: { fn, name: fn.name }, args, output }],
      options
    ),
    { id: `cluster_${id}`, attributes: { label: id } }
  );
};

const box = value => ({ value });
const box2 = value => ({ value: { ...value } });
const square = n => n * n;

const graph = dot.graph({
  directed: true,
  statements: [
    apply(setIn, [{ cities, names }, "cities.1", "Georgetown"]),
    apply(setIn, [{ cities, names }, "names.3", "ringo"]),
    apply(box, [{ cities }]),
    apply(box2, [{ cities }]),
    apply(square, [3]),
    { type: "node", id: "foo" },
    ...names.map(id => ({
      type: "node",
      id,
      attributes: { style: "filled", color: "red", fontcolor: "white" },
    })),
  ],
});
console.log(`graph`, graph);
console.log(`dot.serialize(graph)`, dot.serialize_dot(graph));

display(graph);
