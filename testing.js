const { join, basename, dirname } = require("path");
const { depth_first_walk } = require("@def.codes/graphviz-format");
const tx = require("@thi.ng/transducers");
const {
  transitive_dependencies,
  transitive_dependents,
  transitive_invalidate,
} = require("@def.codes/node-live-require");
// const { map_object } = require("@def.codes/helpers");
// const pt = require("@def.codes/graphviz-format");

const longest_common_prefix = ([first, ...rest]) => {
  let i = 0;
  for (; i < first.length; i++) {
    const char = first[i];
    if (!rest.every(s => s[i] === char)) break;
  }
  return first.slice(0, i);
};

const prefix = longest_common_prefix(Object.keys(require.cache));

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

const graph = {};
for (const [name, mod] of Object.entries(require.cache))
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

const view = [
  { path: "example" },
  ...Object.keys(graph).map(key => ({ path: ["graph", key] })),
];

// const filename = require.resolve("./testing");
const filename = require.resolve("ws");
const example = {
  filename: normalize(filename),
  dependencies: [...transitive_dependencies(filename)].map(normalize).sort(),
  dependents: [...transitive_dependents(filename)].map(normalize).sort(),
};

module.exports = {
  graph,
  view,
  example,
};
