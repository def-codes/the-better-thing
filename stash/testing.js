const tx = require("@thi.ng/transducers");
const { Graph, from_facts } = require("@def.codes/graphs");
const { map_object } = require("@def.codes/helpers");
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

//////////////////////////////////
// we don't want to think in graphviz terms per se
// the point here is to group things independently
function cluster_from(graph, spec, name, more) {
  // how do we know whether the thing is already a graph?
  // and does that matter?
  // look. this is already not hard
  return {
    type: "subgraph",
    id: `cluster_${name || nextid()}`,
    statements: [...dot.statements_from_graph(graph, spec)],
    ...(more ? more : {}),
  };
}
///////////////////////////////////

//////////////////////// for module
// put a thing through a sequence of processing steps
// in which you can view each, or only the last
// this is towards a general thing but for right now is graphviz oriented
// fns can be an array, but a dict (ordered) might be better
// so you can reference points in the pipeline
// but what?  a graph?  or an arbitrary value?  either, obviously
// but the question is, at what point do you invoke the graphviz interpreter?
// at *each* stage we must apply graphviz
// in order to
// we might want to look at the graphvi
// stages:
// first: plain object, nothing known about it
//
// last: result of transformation

// make fns an object of fns?  (for name)
function* pipeline(fns, val) {
  let acc = val;
  for (const fn of fns) yield [fn, (acc = fn(acc))];
}
function* view_pipeline(input, results) {
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
/////////////////////

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

const workflow = new Graph();
// workflow.add_node("input", "value");
// workflow.add_node("fn1", "function");
// workflow.add_node("fn2", "function");
// workflow.add_node("result1", "value");
workflow.add_edge("input", "fn1");
workflow.add_edge("fn1", "result1");
workflow.add_edge("result1", "fn2");

workflow.add_edge("value", "graph?");
workflow.add_edge("graph?", "graph", "yes");
workflow.add_edge("graph?", "traversal", "no");
workflow.add_edge("traversal", "graph", "graph\nreducer");
workflow.add_edge("graph", "dot", "graph-dot\nspec");
const workflow_spec = {
  describe_edge: ([, , label]) => label && { label },
  describe_node: (id, type) =>
    (/\?/.test(id) && { shape: "diamond" }) ||
    ((id.startsWith("fn") || type === "function") && { shape: "square" }),
};

const test_graph_2 = new Graph();
test_graph_2.add_node(13);
test_graph_2.add_node(15);
test_graph_2.add_node(17);
test_graph_2.add_edge(13, 15);
test_graph_2.add_edge(15, 13);
test_graph_2.add_edge(113, 117, { birthday: "today" });
test_graph_2.add_edge(15, 17);
test_graph_2.add_edge(17, 15);

const spec2 = {
  describe_node: id => {
    if (id > 4) return { style: "filled", color: "red", fontcolor: "white" };
  },
  describe_edge: p => {
    console.log(`p`, p);

    const [from, to, data] = p;
    if (data && data.birthday === "today")
      return { color: "blue", penwidth: 5 };
    if (from >= 4) return { color: "green", label: "no!" };
  },
};

// a graph mapping that prepends the given string to each id in a graph stream.
// but you end up seeing this as the key.  rather want to see the label
const prefix_keys = prefix =>
  map_object((value, key) =>
    key === "subject" || key === "object" ? `${prefix}${value}` : value
  );

const graph = dot.graph({
  directed: true,
  attributes: {
    // rankdir: "LR"
    layout: "circo",
  },
  statements: [
    // cluster_from(test_graph_2, spec2, "test2", {
    //   node_attributes: { shape: "circle" },
    // }),
    cluster_from(workflow, workflow_spec),
    ...view_pipeline({ hello: "world" }, [
      ...pipeline(
        [
          function box(value) {
            return { value };
          },
          function enumerate(value) {
            return Object.entries(value);
          },
        ],
        { hello: "world" }
      ),
    ]),
    {
      type: "subgraph",
      id: `cluster_test1`,
      statements: [...dot.statements_from_graph(test_graph_2, spec2)],
      // node_attributes: { shape: "circle" },
    },
    {
      type: "subgraph",
      id: `cluster_test2`,
      statements: [
        ...dot.statements_from_graph(
          from_facts(tx.map(prefix_keys("help-"), test_graph_2.facts())),
          spec2
        ),
      ],
    },
    {
      type: "subgraph",
      id: `cluster_test3`,
      statements: [
        ...dot.statements_from_graph(
          from_facts(
            tx.map(prefix_keys("potato salad "), test_graph_2.facts())
          ),
          spec2
        ),
      ],
    },

    ///...test_graph.facts()
    Object.assign(
      dot.object_graph_to_dot_subgraph([test_graph_2._nodes], options),
      { id: `cluster_${nextid()}` }
    ),
    Object.assign(
      dot.object_graph_to_dot_subgraph(
        dot.statements_from_graph(test_graph_2, spec2),
        options
      ),
      { id: `cluster_${nextid()}` }
    ),

    //deps(options),
    // modules_subgraph(options),
    // ...directory(options),
    // dot.object_graph_to_dot_subgraph([module], options),

    // Object.assign(
    //   dot.object_graph_to_dot_subgraph(
    //     tx.iterator(
    //       tx.comp(
    //         tx.map(({ value, ...obj }) => obj),
    //         tx.take(6)
    //       ),
    //       dot.depth_first_walk([
    //         // require.cache
    //         // hello: "world",
    //         // an_array: "things and stuff".split(" "),
    //         module,
    //       ])
    //     ),
    //     options
    //   ),
    //   { id: `cluster_${nextid()}` }
    // ),
    // { type: "node", id: "foo" },
  ],
});

console.log(`line 81`);

// console.log(`graph`, graph);
// console.log(`dot.serialize(graph)`, dot.serialize_dot(graph));

display(graph);
