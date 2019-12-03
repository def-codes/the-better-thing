const { display } = require("@def.codes/node-web-presentation");
//const { t } = require("@def.codes/node-live-require");
const dot = require("@def.codes/graphviz-format");
const { modules_subgraph } = require("./modules-subgraph");

let count = 0;
const nextid = () => `n${count++}`;

const walker_state = dot.empty_traversal_state();
const options = { state: walker_state };

const graph = dot.graph({
  directed: true,
  attributes: { rankdir: "LR" },
  statements: [modules_subgraph(options), { type: "node", id: "foo" }],
});
console.log(`graph`, graph);
console.log(`dot.serialize(graph)`, dot.serialize_dot(graph));

display(graph);
