const tx = require("@thi.ng/transducers");
const { isPlainObject } = require("@thi.ng/checks");
const { traverse1 } = require("./lib/traverse");
const { Graph, from_facts } = require("@def.codes/graphs");
const { make_display } = require("@def.codes/node-web-presentation");
const dot = require("@def.codes/graphviz-format");
const { pipeline } = require("./lib/pipeline");
const { prefix_keys } = require("./lib/clustering");
const { visit_all_factors, visit_prime_factors } = require("./lib/factorize");
const {
  make_walk_object_spec,
  obj_walk_dot_spec,
} = require("./lib/object-graph");
const { some_object_graph } = require("./lib/test-object-graph");

// this is a sequence you could iterate through
const N = 1184;

const dot_spec_edge_label = {
  describe_edge: ([, , label]) => label && { label },
};

// doesn't detect cycles
const object_record = o =>
  Object.entries(o).map(([key, value]) => ({
    key,
    value:
      value == null
        ? ""
        : isPlainObject(value)
        ? object_record(value)
        : dot.is_reference_type(value)
        ? "(ref)"
        : value,
  }));

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

const get_it = () => traverse1([some_object_graph.cycle], walk_object_spec);
const before_transform = get_it();
const after_transform = tx.map(_ => {
  if (_.subect && _.object) return false;
}, get_it());
const walker_state = dot.empty_traversal_state();
const opts = { state: walker_state };

let i = 0;

const old_view = o => ({
  type: "subgraph",
  id: `cluster_${i++}`,
  statements: [dot.object_graph_to_dot_subgraph([o], opts)],
});

const old_graph = o => ({
  type: "subgraph",
  id: `cluster_${i++}`,
  statements: [
    dot.object_graph_to_dot_subgraph(
      [
        [
          ...tx.map(arg => {
            if (arg) {
              const { value, ...r } = arg;
              return 1;
            }
            return { arg };
          }, o),
        ],
      ],
      opts
    ),
  ],
});

const bundles = [factors, objects];
const bundle = bundles[1];

const new_view = bundle => {
  const { input, traversal_spec, dot_spec } = bundle;
  const traversed = [...traverse1([input], traversal_spec)];
  // const constructed = from_facts(tx.map(prefix_keys("NN"), traversed));
  const constructed = from_facts(traversed);

  return {
    type: "subgraph",
    node_attributes: { shape: "circle" },
    statements: [...dot.statements_from_graph(constructed, dot_spec)],
  };
};

const graph = dot.graph({
  directed: true,
  attributes: {
    titie: "wuuuut", // title in svg is instead %3 for some reason
    rankdir: "LR",
    // newrank: true,
    // layout: "circo",
    // splines: false,
  },
  statements: [
    new_view(bundle),
    // old_view(nested_dict),
    // old_graph(before_transform),
    // old_graph(after_transform),
  ],
});
const { inspect } = require("util");
//console.log(`graph`, inspect(graph, { depth: 8 }));

(state.display || (state.display = make_display())).graph(graph);
