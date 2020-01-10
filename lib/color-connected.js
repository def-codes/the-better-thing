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

// GIVEN connected components, return dot statements coloring by label
function* color_connected_components(components, colors = DEFAULT_COLORS) {
  for (let i = 0; i < components.length; i++)
    for (const id of components[i])
      yield {
        type: "node",
        id: id.value,
        attributes: { style: "filled", color: colors[i] },
      };
}

// return dot statements asserting node colors based on connected component index
// finds AND colors
function color_connected(store, spec) {
  spec = spec || {};
  // how many items to cover; omit for all
  const n = typeof spec.n === "number" ? spec.n : undefined;
  const colors = spec.colors || DEFAULT_COLORS;

  const graph = triple_store_graph(store);
  let components, items;
  if (typeof n === "number") items = [...tx.take(n, component_nodes(graph))];
  else components = connected_component_nodes(graph);

  let annotations = [];
  if (components) {
    annotations = color_connected_components(components, colors);
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

module.exports = { color_connected_components, color_connected };
