const tx = require("@thi.ng/transducers");
const { Graph } = require("@def.codes/graphs");
const { display } = require("@def.codes/node-web-presentation");
const {
  transitive_dependencies,
  transitive_dependents,
  reverse_index,
} = require("@def.codes/node-live-require");
const dot = require("@def.codes/graphviz-format");
const {
  modules_subgraph,
  longest_common_prefix,
} = require("./modules-subgraph");

let count = 0;
const nextid = () => `n${count++}`;

const walker_state = dot.empty_traversal_state();
const options = { state: walker_state };

function* example_sequence() {
  for (let i = 0; i < 10; i++) yield { i };
}

const descend0 = (items, key, get_value, get_next) =>
  // tx.transduce(tx.map(get_next), tx.groupByObj({ key }), items);
  tx.transduce(tx.noop(), tx.groupByObj({ key }), items);

const descend = (items, get_key, get_value, get_next) => {
  const ret = {};
  for (const blah of items) {
    const mapped = get_next(blah);
    const key = get_key(mapped);
    const value = get_value(mapped);
    (ret[key] || (ret[key] = [])).push(value);
  }
  const entries = Object.entries(ret);
  if (entries.length > 1)
    for (const [key, values] of entries)
      ret[key] = descend(values, get_key, get_value, get_next);
  return ret;
};

const make_tree = (items, spec) => {
  const ret = {};
  for (const item of items) {
    const mapped = spec.intermediate ? spec.intermediate(item) : item;
    const key = spec.get_key(mapped);
    const value = spec.get_value(mapped);
    (ret[key] || (ret[key] = [])).push(value);
  }
  const entries = Object.entries(ret);
  if (spec.is_terminal(ret))
    for (const [key, values] of entries) ret[key] = make_tree(values, spec);
  return ret;
};

const split_seg = s => {
  const [, path = "", rest] = s.match(/(?:(.*?)\/)?(.*)/);
  return [path, rest];
};

function* directory(options) {
  const names = Object.keys(require.cache).map(_ => _.replace(/\\/g, "/"));
  const prefix = longest_common_prefix(names);
  const trimmed = names.map(_ => _.substring(prefix.length));
  const first_seg = trimmed.map(split_seg);

  const grouped = tx.transduce(
    tx.noop(),
    tx.groupByObj({ key: _ => _[0] }),
    first_seg
  );

  const split = trimmed.map(_ => _.split("/"));

  const first = _ => _[0];
  const second = _ => _[1];

  // yield dot.object_graph_to_dot_subgraph([trimmed], options);

  yield Object.assign(
    dot.object_graph_to_dot_subgraph(
      // [descend(trimmed, first, second, split_seg)],
      [
        make_tree(names, {
          intermediate: split_seg,
          get_key: first,
          get_value: second,
          is_terminal: _ =>
            Object.values(_).some(_ => _.some(_ => /\//.test(_))),
        }),
      ],
      options
    ),
    {
      // id: `cluster_${item.key}`,
      id: `cluster_${nextid()}`,
    }
  );

  yield Object.assign(
    // dot.object_graph_to_dot_subgraph([[...example_sequence()]], options),
    dot.object_graph_to_dot_subgraph([...example_sequence()], options),
    { id: `cluster_${nextid()}` }
  );

  // yield dot.subgraph({statements: entries.map(() => ({type: "node"}))})

  // for (const [path, entries] of Object.entries(grouped))
  //   yield Object.assign(dot.object_graph_to_dot_subgraph([entries], options), {
  //     id: `cluster_${path}`,
  //   });

  yield dot.object_graph_to_dot_subgraph(
    [
      {
        // names,
        // prefix,
        // trimmed,
        // grouped,
      },
    ],
    options
  );
}

function deps(options) {
  const trim = s => s.split(/node_modules/)[1] || s;
  const filename = require.resolve("ws");
  const example = {
    filename: trim(filename),
    dependencies: [...transitive_dependencies(filename)].map(trim).sort(),
    dependents: [...transitive_dependents(filename)].map(trim).sort(),
    // index: reverse_index(require.cache),
  };
  return dot.object_graph_to_dot_subgraph([example], options);
}

const test_graph = new Graph();
test_graph.add_node(3);
test_graph.add_node(5);
test_graph.add_node(7);
test_graph.add_edge(3, 5);
test_graph.add_edge(5, 3);
test_graph.add_edge(3, 7);
test_graph.add_edge(5, 7);
test_graph.add_edge(7, 5);

const test_graph_2 = new Graph();
test_graph_2.add_node(13);
test_graph_2.add_node(15);
test_graph_2.add_node(17);
test_graph_2.add_edge(13, 15);
test_graph_2.add_edge(15, 13);
test_graph_2.add_edge(113, 117);
test_graph_2.add_edge(15, 17);
test_graph_2.add_edge(17, 15);

const spec2 = {
  describe_node: id => {
    if (id > 4) return { style: "filled", color: "red", fontcolor: "white" };
  },
};

const graph = dot.graph({
  directed: true,
  attributes: { rankdir: "LR" },
  statements: [
    {
      type: "subgraph",
      id: "cluster_testing_2",
      statements: [...dot.statements_from_graph(test_graph_2)],
      node_attributes: { shape: "circle" },
    },
    {
      type: "subgraph",
      id: "cluster_testing",
      statements: [...dot.statements_from_graph(test_graph, spec2)],
    },
    //deps(options),
    // modules_subgraph(options),
    // ...directory(options),
    // dot.object_graph_to_dot_subgraph([module], options),

    Object.assign(
      dot.object_graph_to_dot_subgraph(
        tx.iterator(
          tx.comp(
            tx.map(({ value, ...obj }) => obj),
            tx.take(6)
          ),
          dot.depth_first_walk([
            // require.cache
            // hello: "world",
            // an_array: "things and stuff".split(" "),
            module,
          ])
        ),

        options
      ),
      { id: `cluster_${nextid()}` }
    ),
    // { type: "node", id: "foo" },
  ],
});

console.log(`line 81`);

// console.log(`graph`, graph);
// console.log(`dot.serialize(graph)`, dot.serialize_dot(graph));

display(graph);
