const tx = require("@thi.ng/transducers");
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

function* descend(items, key, get_value, get_next) {
  const grouped = tx.transduce(tx.map(get_next), tx.groupByObj({ key }), items);
  const entries = Object.entries(grouped);
  if (entries.length <= 1) yield Object.values();
  else
    for (const [k, group] of entries) {
      yield tx.transduce(
        tx.map(Object.entries),
        tx.assocObj(),
        descend(group.map(get_value), key, get_value, get_next)
      );
    }
}

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

  for (const item of descend(trimmed, first, second, split_seg)) {
    yield Object.assign(dot.object_graph_to_dot_subgraph([item], options), {
      // id: `cluster_${item.key}`,
      id: `cluster_${nextid()}`,
    });
  }

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

const graph = dot.graph({
  directed: true,
  attributes: { rankdir: "LR" },
  statements: [
    //deps(options),
    // modules_subgraph(options),
    ...directory(options),
    // { type: "node", id: "foo" },
  ],
});

console.log(`line 68`);

// console.log(`graph`, graph);
// console.log(`dot.serialize(graph)`, dot.serialize_dot(graph));

display(graph);
