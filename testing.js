const tx = require("@thi.ng/transducers");
const { Graph, from_facts } = require("@def.codes/graphs");
const { has_items } = require("@def.codes/helpers");
const { make_display } = require("@def.codes/node-web-presentation");
const dot = require("@def.codes/graphviz-format");
const { pipeline } = require("./lib/pipeline");
const { prefix_keys } = require("./lib/clustering");
const { visit_all_factors, visit_prime_factors } = require("./lib/factorize");

const some_object_graph = {
  something: ["non", "trivial"],
  nested: [4, 5, 6, 3, 5, 9, 888],
  foo: new Map([
    [3, 0],
    [{ blah: "blahhh" }, "BLAH"],
  ]),
};

const EMPTY_ARRAY = [];
const DEFAULT_MOVES_FROM = () => EMPTY_ARRAY;
const DEFAULT_VALUE_OF = () => {};
const DEFAULT_ID_OF = x => x;

function* traverse1(starts, spec, state) {
  state = state || {};
  spec = spec || {};
  const queue = state.queue || (state.queue = []);
  const visited = state.visited || (state.visited = new Set());
  const moves_from = spec.moves_from || DEFAULT_MOVES_FROM;
  const value_of = spec.value_of || DEFAULT_VALUE_OF;
  const id_of = spec.id_of || DEFAULT_ID_OF;
  for (const start of starts) queue.push(start);

  while (has_items(queue)) {
    const raw = queue.pop();
    const subject = id_of(raw);
    const value = value_of(raw);
    // conditional yield?
    yield { subject, value };
    if (!visited.has(subject))
      for (const [o, data] of moves_from(subject, value)) {
        const object = id_of(o);
        yield { subject, object, data };
        queue.push(o);
      }
    visited.add(subject);
  }
}

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

const input = some_object_graph; // N
const traversal_spec = walk_object_spec; // visit_all_factors;
const dot_spec = obj_walk_dot_spec;

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

    // ...pipeline(32, [all_factorize]),

    // ...pipeline(32, [
    //   // factorize,
    //   function traverse(n) {
    //     return [...traverse1([n], factor_spec)].filter(_ => _.object);
    //   },
    //   from_facts,
    //   function graphviz(graph) {
    //     return [...dot.statements_from_graph(graph)];
    //   },
    // ]),
  ],
});
const { inspect } = require("util");
//console.log(`graph`, inspect(graph, { depth: 8 }));

console.log(`state`, state);

(state.display || (state.display = make_display())).graph(graph);

// from_facts,
// function box(value) {
//   return { value };
// },
// function enumerate(value) {
//   return Object.entries(value);
// },
// shallow_clone,
// deep_clone,
