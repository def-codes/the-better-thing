const show = require("./lib/show");
// const { clusters_from } = require("./lib/clustering");
const { q } = require("@def.codes/meld-core");
const { RDFTripleStore } = require("@def.codes/rstream-query-rdf");
const { BinarySearchTree } = require("@def.codes/helpers");

let n = 0;
const dum = () => `d${n++}`;
function* temp_binary_tree_dot({ left, right, value: id }) {
  // avoid need for assigned id, since value is unique in search tree
  yield {
    type: "node",
    id,
    // Make circle relatively proportional to value
    // attributes: { width: (id / 20).toFixed(4) },
  };
  if (!left && !right) return;

  const make_dum = (label, to = dum(), style = "dotted", color = "gray") => [
    { type: "node", id: to, attributes: { style, color, fontcolor: color } },
    {
      type: "edge",
      from: id,
      to,
      attributes: { label, style, color, fontcolor: color },
    },
  ];
  // Dot seems to align L/R as expected if they appear in this order
  if (left) {
    yield {
      type: "edge",
      from: id,
      to: left.value,
      // attributes: { label: "L" },
    };
    yield* temp_binary_tree_dot(left);
  } else yield* make_dum("L");
  if (right) {
    yield {
      type: "edge",
      from: id,
      to: right.value,
      // attributes: { label: "R" },
    };
    yield* temp_binary_tree_dot(right);
  } else yield* make_dum("R");
}

const main = () => {
  const tree = new BinarySearchTree(50);
  const N = 200,
    M = 200;
  const rand = max => Math.floor(Math.random() * max);
  const rands = [];
  for (let n = 0; n < N; n++) rands.push(rand(200) - 100);
  const ns = [5, 9, 8, 77, 9, 73, -3, 34, 356, 19, 1];
  const nums = rands.slice(0, M);
  for (const n of nums) tree.insert(n);
  const statements = [...temp_binary_tree_dot(tree)];

  const store = new RDFTripleStore();
  store.into(q("a p b", "b p c", "c p b"));

  // const dot_statements = show.store(store);

  // The default graph `rankdir` (TB) happens to be the traditional one for
  // binary tree notations.
  return {
    dot_graph: {
      node_attributes: { shape: "circle" },
      attributes: { rankdir: "TD", label: nums.join(", ").slice(0, 100) },
      statements,
    },
  };
};

exports.display = main();
