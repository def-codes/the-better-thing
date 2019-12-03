const { display } = require("@def.codes/node-web-presentation");
const {
  transitive_dependencies,
  transitive_dependents,
  reverse_index,
} = require("@def.codes/node-live-require");
const dot = require("@def.codes/graphviz-format");
const {
  modules_subgraph,
  longest_common_prefix,
} = require("./modules-subgraph");

let count = 0;
const nextid = () => `n${count++}`;

const walker_state = dot.empty_traversal_state();
const options = { state: walker_state };

function directory(options) {
  const names = Object.keys(require.cache).map(_ => _.replace(/\\/g, "/"));
  const prefix = longest_common_prefix(names);
  const trimmed = names.map(_ => _.substring(prefix.length));
  const split = trimmed.map(_ => _.split("/"));
  return dot.object_graph_to_dot_subgraph(
    [{ names, prefix, trimmed }],
    options
  );
}

function deps(options) {
  const trim = s => s.split(/node_modules/)[1] || s;
  const filename = require.resolve("ws");
  const example = {
    filename: trim(filename),
    dependencies: [...transitive_dependencies(filename)].map(trim).sort(),
    dependents: [...transitive_dependents(filename)].map(trim).sort(),
    // index: reverse_index(require.cache),
  };
  return dot.object_graph_to_dot_subgraph([example], options);
}

const graph = dot.graph({
  directed: true,
  attributes: { rankdir: "LR" },
  statements: [
    deps(options),
    // modules_subgraph(options),
    // directory(options),
    // { type: "node", id: "foo" },
  ],
});
console.log(`line 39`);

console.log(`graph`, graph);
console.log(`dot.serialize(graph)`, dot.serialize_dot(graph));

display(graph);
