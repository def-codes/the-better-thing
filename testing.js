const tx = require("@thi.ng/transducers");
const diff = require("@thi.ng/diff");
const { isPlainObject } = require("@thi.ng/checks");
const { Graph, from_facts, traverse } = require("@def.codes/graphs");
const dot = require("@def.codes/graphviz-format");
const { pipeline } = require("./lib/pipeline");
const { prefix_keys } = require("./lib/clustering");
const { visit_all_factors, visit_prime_factors } = require("./lib/factorize");
const { some_object_graph } = require("./lib/test-object-graph");
const {
  make_object_graph_traversal_spec,
  object_graph_dot_notation_spec,
} = require("@def.codes/node-web-presentation");

// this is a sequence you could iterate through
const N = 1184;

const longest_common_prefix = ([first, ...rest]) => {
  let i = 0;
  for (; i < first.length; i++) {
    const char = first[i];
    if (!rest.every(s => s[i] === char)) break;
  }
  return first.slice(0, i);
};

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

const walk_object_spec = make_object_graph_traversal_spec();

// const v1 = [..."Santa Barbara"];
// const v2 = [..."Hanna Barbara"];
const v1 = [..."Santa"];
const v2 = [..."Hanna"];
const o1 = { name: "Santa" };
const o2 = { name: "Hanna" };
const a1 = ["ul", {}, ["li", {}, "business"], ["li", {}, "party"]];
const a2 = [
  "ul",
  {},
  ["li", {}, "business"],
  ["li", {}, "casual"],
  ["li", {}, "party"],
];

const identity = x => x;
const apply1 = (fn, args) => ({ input: args, fn, output: fn(...args) });
const double = n => n * 2;
const box = value => ({ value });
var application_examples = [
  // [double, [3]],
  // [box, ["hello"]],
  // [
  //   object_graph_dot_notation_spec.describe_node,
  //   ["n1", { application_examples }],
  // ],
  // [identity, v1],
  // [diff.diffArray, [v1, v2, diff.DiffMode.FULL]],
  // [diff.diffObject, [o1, o2, diff.DiffMode.FULL]],
  [diff.diffArray, [a1, a2, diff.DiffMode.FULL]],
].map(([fn, args]) => apply1(fn, args));

const objects = {
  ...{
    traversal_spec: walk_object_spec,
    dot_spec: object_graph_dot_notation_spec,
  },
  input: [application_examples, some_object_graph][0],
};
const factors = {
  ...{
    traversal_spec: visit_all_factors,
    dot_spec: dot_spec_edge_label,
  },
  input: N,
};

// convert back into (what was probably) the original module id
const normalize = s => {
  if (!s.startsWith(prefix)) throw `expected ${s} to start with ${prefix}`;
  s = s
    .slice(prefix.length)
    .replace(/\\/g, "/")
    .replace(/(^node_modules\/|(\/index)?\.js$)/g, "");
  if (s.startsWith("@thi.ng")) s = s.replace(/\/lib/, "");
  return s;
};

const all_modules = Object.values(require.cache);
const prefix = longest_common_prefix(Object.keys(require.cache));
const modules = {
  traversal_spec: {
    id_of: mod => normalize(mod.id),
    value_of: mod => mod,
    moves_from: (_, mod) => (mod ? mod.children.map(child => [child]) : []),
  },
  dot_spec: { describe_node: () => ({ shape: "none" }) },
  inputs: Object.values(require.cache),
};

const get_it = () => traverse([some_object_graph.cycle], walk_object_spec);
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

const bundles = [factors, objects, modules];
const bundle = bundles[1];

const new_view = bundle => {
  const { input, inputs, traversal_spec, dot_spec } = bundle;
  const traversed = [...traverse(inputs || [input], traversal_spec)];
  // const constructed = from_facts(tx.map(prefix_keys("NN"), traversed));
  const constructed = from_facts(traversed);
  const statements = [...dot.statements_from_graph(constructed, dot_spec)];
  const subgraph = { type: "subgraph", statements };
  return { ...bundle, traversed, constructed, statements, subgraph };
};

const more_statements = [
  { type: "node", id: 0, attributes: { style: "filled", color: "orange" } },
];

const graph = (function() {
  const { subgraph, statements, traversed, constructed } = new_view(bundle);

  // change all DOT nodes with a color to have color yellow
  // But I don't really want to mess with the dot directly
  const change_all_color_to_yellow = statements
    .filter(_ => _.attributes && _.attributes.color)
    .map(({ attributes, ...rest }) => ({
      ...rest,
      attributes: { ...attributes, color: "yellow" },
    }));

  const traversal_spec_from_graph = graph => ({
    value_of: id => graph.get_node(id),
    moves_from: id => graph.edges_from(id),
  });

  const reachable_from = n =>
    dot.statements_from_graph(
      from_facts(traverse([n], traversal_spec_from_graph(constructed)))
    );

  // const new_trav = [...traverse([2], traversal_spec_from_graph(constructed))];

  const reachable_from_1 = tx.map(
    // identity,
    _ => ({ ..._, attributes: { color: "red" } }),
    reachable_from(4)
  );

  const reachable_from_2 = reachable_from(2);

  const matching_predicate = (pred, attributes) =>
    tx.map(
      _ => ({ ..._, attributes }),
      dot.statements_from_graph(
        from_facts(traversed.filter(_ => pred(_.value)))
      )
    );

  const matching = matching_predicate(
    [Array.isArray, x => x && Object.keys(x).length > 3][1],
    {
      // shape: "none",
      // label: "",
      color: "#AA0000",
      style: "filled",
      // fontcolor: "white",
    }
  );

  const more_statements = [
    {
      type: "subgraph",
      id: "cluster input",
      attributes: { label: "input" },
      // this doesn't work
      // node_attributes: { color: "red" },
      statements: reachable_from(2),
    },
    {
      type: "subgraph",
      id: "cluster output",
      attributes: { label: "output" },
      statements: reachable_from(4),
    },
  ];

  return dot.graph({
    strict: true, // because I'm doubling everything up there
    directed: true,
    attributes: {
      titie: "wuuuut", // title in svg is instead %3 for some reason
      // rankdir: "LR",
      // newrank: true,
      // layout: "circo",
      splines: false,
    },
    statements: [subgraph, ...(more_statements || [])],
  });
})();

exports.display = { graph };
