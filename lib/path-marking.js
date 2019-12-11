const tx = require("@thi.ng/transducers");
const { follow_path, step } = require("@def.codes/graphs");
const { mark_edges } = require("./marking");

const label_equals = key => step(data => data === key);

const path_predicates = keys => keys.map(label_equals);

// return statements with attributed nodes and edges
exports.mark_path = ({ graph, start, path, edge_marking, node_marking }) => {
  // works but can't drill into record-type labels
  // would need html labels to support that

  const predicates = path_predicates(path);

  const tuples = [...follow_path(graph, 0, predicates)];

  const path_ids = [start, ...tx.map(([id]) => id, tuples)];

  const partitioned = [...tx.partition(2, 1, path_ids)];

  const pairs = [
    ...tx.map(([subject, object]) => ({ subject, object }), partitioned),
  ];

  const marked_end_of_path = {
    type: "node",
    id: path_ids[path_ids.length - 1],
    attributes: node_marking,
  };
  const marked_path_segments = mark_edges(pairs, edge_marking);

  return [...marked_path_segments, marked_end_of_path];
};
