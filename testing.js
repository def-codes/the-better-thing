const tx = require("@thi.ng/transducers");
const { isPlainObject } = require("@thi.ng/checks");
const { traverse1 } = require("./lib/traverse");
const { Graph, from_facts } = require("@def.codes/graphs");
const { make_display } = require("@def.codes/node-web-presentation");
const dot = require("@def.codes/graphviz-format");
const { pipeline } = require("./lib/pipeline");
const { prefix_keys } = require("./lib/clustering");
const { visit_all_factors, visit_prime_factors } = require("./lib/factorize");

const is_reference_type = x =>
  x && (typeof x === "object" || typeof x === "function");
const is_primitive = x => !is_reference_type(x);
const is_leaf_object = o =>
  isPlainObject(o) && Object.values(o).every(is_primitive);

const B = {};
const A = { a: 1, b: B };
B.A = A;
const simple_record = { name: "Joe", age: 89, children: ["Hunter", "Bo"] };
const ac1 = { voltage: 44.4, current: 0.1 };
const ac2 = { voltage: 39.0, current: 1.1 };
const nested_dict = { ac1, ac2 };
const array_of_objects = [
  { name: "Gavin", age: 41 },
  { name: "Kim", age: 39 },
  { name: "Aria", age: 9 },
  { name: "Tremé", age: 7 },
];
const cycle = { B };
const examples = { simple_record, cycle };
const subject = cycle; //{ examples };

const some_object_graph = {
  nested_dict,
  array_of_objects,
  something: ["non", "trivial"],
  a_record: { name: "flannery", age: 109 },
  a_record_with_nesting: {
    name: "moishe",
    age: 112,
    children: { jonah: 44, preston: 29 },
  },
  nested: [4, 5, 6, 3, 5, 9, 888],
  nested2: [["james", "jimmy"]],

  a_set: new Set([{ expository: "dialogue" }]),
  a_map: new Map([
    [3, 0],
    [{ blah: "blahhh" }, "BLAH"],
  ]),
};

// this is a sequence you could iterate through
const N = 1184;

const make_indexer = (indices = new Map()) => o =>
  indices.get(o) || /* ?? */ indices.set(o, indices.size).size - 1;

const make_walk_object_spec = (id_of = make_indexer()) => ({
  id_of,
  value_of: x => x,
  moves_from: (_, thing) =>
    tx.map(
      ([key, value]) => [value, key],
      tx.filter(
        ([, value]) => dot.is_reference_type(value),
        dot.members_of(thing)
      )
    ),
});

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

const obj_walk_dot_spec = {
  describe_node(id, value) {
    if (Array.isArray(value))
      return {
        shape: "Mrecord",
        tooltip: id,
        label: value.map((value, key) => [
          key,
          { key, value: is_primitive(value) ? value : "" },
        ]),
      };

    if (isPlainObject(value))
      return {
        ...(is_leaf_object(value)
          ? { style: "filled", color: "lightblue" }
          : {}),
        tooltip: id,
        shape: "Mrecord",
        label: Object.entries(value).map(([key, value]) => [
          key,
          { key, value: is_primitive(value) ? value : "" },
        ]),
      };

    if (value) return { label: JSON.stringify(value, null, 2) };
  },
  describe_edge([from, to, data]) {
    if (data != null)
      return {
        tailport: `${data}:c`,
        tailclip: false,
        dir: "both",
        arrowtail: "dot",
      };
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

const get_it = () => traverse1([subject], walk_object_spec);
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
    rankdir: "LR",
    newrank: true,
    // layout: "circo",
    // splines: false,
  },
  statements: [
    new_view(bundle),
    // old_view(nested_dict),
    // old_graph(before_transform),
    old_graph(after_transform),
  ],
});
const { inspect } = require("util");
//console.log(`graph`, inspect(graph, { depth: 8 }));

(state.display || (state.display = make_display())).graph(graph);
