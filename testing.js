const tx = require("@thi.ng/transducers");
const { traverse1 } = require("./lib/traverse");
const { Graph, from_facts } = require("@def.codes/graphs");
const { make_display } = require("@def.codes/node-web-presentation");
const dot = require("@def.codes/graphviz-format");
const { pipeline } = require("./lib/pipeline");
const { prefix_keys } = require("./lib/clustering");
const { visit_all_factors, visit_prime_factors } = require("./lib/factorize");

const some_object_graph = {
  something: ["non", "trivial"],
  nested: [4, 5, 6, 3, 5, 9, 888],

  "a set": new Set([{ expository: "dialogue" }]),
  foo: new Map([
    [3, 0],
    [{ blah: "blahhh" }, "BLAH"],
  ]),
};

// this is a sequence you could iterate through
const N = 1184;

const make_indexer = () => {
  const indices = new Map();
  const index_of = o =>
    // indices.get(o) ?? indices.set(o, indices.size).size - 1;
    indices.get(o) || indices.set(o, indices.size).size - 1;
  return index_of;
};

const make_walk_object_spec = (id_of = make_indexer()) => ({
  id_of,
  value_of: x => x,
  moves_from: (_, thing) =>
    tx.map(([key, value]) => [value, key], dot.members_of(thing)),
});

const dot_spec_edge_label = {
  describe_edge: ([, , label]) => label && { label },
};

const obj_walk_dot_spec = {
  describe_node(id, value) {
    if (value) return { label: JSON.stringify(value) };
  },
  describe_edge([from, to, data]) {
    if (data) return { label: JSON.stringify(data) };
  },
};

const walk_object_spec = make_walk_object_spec();

const objects = {
  ...{
    traversal_spec: walk_object_spec,
    dot_spec: obj_walk_dot_spec,
  },
  input: some_object_graph,
};
const factors = {
  ...{
    traversal_spec: visit_all_factors,
    dot_spec: dot_spec_edge_label,
  },
  input: N,
};

const bundles = [factors, objects];
const bundle = bundles[1];

const { input, traversal_spec, dot_spec } = bundle;
const traversed = [...traverse1([input], traversal_spec)];
// const constructed = from_facts(tx.map(prefix_keys("NN"), traversed));
const constructed = from_facts(traversed);

const graph = dot.graph({
  directed: false,
  attributes: {
    rankdir: "LR",
    layout: "circo",
    // splines: false,
  },
  statements: [
    {
      type: "subgraph",
      node_attributes: { shape: "circle" },
      statements: [...dot.statements_from_graph(constructed, dot_spec)],
    },

    // {
    //   type: "subgraph",
    //   statements: [
    //     dot.object_graph_to_dot_subgraph([
    //       tx.map(prefix_keys("B"), traverse1([N], factor_spec)),
    //     ]),
    //   ],
    // },
  ],
});
const { inspect } = require("util");
//console.log(`graph`, inspect(graph, { depth: 8 }));

(state.display || (state.display = make_display())).graph(graph);
