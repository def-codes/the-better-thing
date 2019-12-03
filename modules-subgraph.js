const dot = require("@def.codes/graphviz-format");

const longest_common_prefix = ([first, ...rest]) => {
  let i = 0;
  for (; i < first.length; i++) {
    const char = first[i];
    if (!rest.every(s => s[i] === char)) break;
  }
  return first.slice(0, i);
};

// make a dot-friendly version of current module dependency graph
const modules_subgraph = (options, cache = require.cache) => {
  const prefix = longest_common_prefix(Object.keys(cache));

  // convert back into (what was probably) the original module id
  const normalize = s => {
    if (!s.startsWith(prefix)) throw `expected ${s} to start with ${prefix}`;
    s = s
      .slice(prefix.length)
      .replace(/\\/g, "/")
      .replace(/(^node_modules\/|(\/index)?\.js$)/g, "");
    // SPECIAL CASE
    if (s.startsWith("@thi.ng")) s = s.replace(/\/lib/, "");
    return s;
  };

  const graph = {};
  for (const [name, mod] of Object.entries(cache))
    graph[normalize(name)] = {
      id: normalize(mod.filename),
      dependencies: mod.children.map(_ => normalize(_.filename)),
    };

  // project deps onto object so each points from this node
  for (const mod of Object.values(graph))
    delete Object.assign(
      mod,
      mod.dependencies.map(id => graph[id])
    ).dependencies;

  return dot.object_graph_to_dot_subgraph([...Object.values(graph)], options);
};

module.exports = { longest_common_prefix, modules_subgraph };
