const tx = require("@thi.ng/transducers");
const {
  traverse,
  triple_store_graph,
  component_nodes,
  connected_component_nodes,
} = require("@def.codes/graphs");

const DEFAULT_COLORS = "red orange yellow green blue indigo violet gray pink darkblue".split(
  " "
);

// return dot statements asserting node colors based on connected component index
function color_connected(store, spec) {
  spec = spec || {};
  // how many items to cover; omit for all
  const n = typeof spec.n === "number" ? spec.n : undefined;
  const colors = spec.colors || DEFAULT_COLORS;

  const graph = triple_store_graph(store);
  let components, items;
  if (typeof n === "number") items = [...tx.take(n, component_nodes(graph))];
  else components = connected_component_nodes(graph);

  const annotations = [];
  if (components) {
    for (let i = 0; i < components.length; i++)
      for (const id of components[i])
        annotations.push({
          type: "node",
          id: id.value,
          attributes: { style: "filled", color: colors[i] },
        });
  } else {
    for (const { subject, group } of items)
      annotations.push({
        type: "node",
        id: subject.value,
        attributes: { style: "filled", color: colors[group] },
      });
  }

  return { graph, annotations };
}

module.exports = { color_connected };
