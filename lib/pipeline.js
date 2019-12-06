const { nextid } = require("./idgen");
const dot = require("@def.codes/graphviz-format");

const walker_state = dot.empty_traversal_state();
const options = { state: walker_state };

function* evaluate_pipeline(input, functions) {
  let acc = input;
  for (const fn of functions) yield [fn, (acc = fn(acc))];
}

function* clusters_from_pipeline(input, results) {
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

function pipeline(input, functions) {
  const results = evaluate_pipeline(input, functions);
  return [...clusters_from_pipeline(input, results)];
}

module.exports = { pipeline };
