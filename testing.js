const { join, basename, dirname } = require("path");
// const { map_object } = require("@def.codes/helpers");
const pt = require("@def.codes/graphviz-format");

// this is just an exhaustive walk, but unfortunately arrows point the wrong way
function* transitive_dependencies(
  filename,
  cache = require.cache,
  visited = new Set()
) {
  visited.add(filename);
  const entry = cache[filename];
  if (entry)
    for (const child of entry.children)
      if (!visited.has(child.filename)) {
        yield child.filename;
        yield* transitive_dependencies(child.filename, cache, visited);
      }
}

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

const deps = {};
for (const [name, mod] of Object.entries(require.cache))
  deps[normalize(name)] = {
    id: normalize(mod.filename),
    dependencies: mod.children.map(_ => normalize(_.filename)),
  };

// this works but map object doesn't let you rewrite key
// const deps = map_object(
//   mod => ({
//     // filename: join(basename(dirname(_.filename)), basename(_.filename)),
//     filename: mod.filename,
//     // // parent: _.parent && basename(_.parent.filename),
//     dependencies: mod.children.map(_ => _.filename),
//   }),
//   require.cache
// );

// project deps onto object so each points from this node
for (const mod of Object.values(deps))
  delete Object.assign(
    mod,
    mod.dependencies.map(id => deps[id])
  ).dependencies;

const view = [
  { path: "example" },
  ...Object.keys(deps).map(key => ({ path: ["deps", key] })),
];

const filename = require.resolve("./testing");
const example = {
  filename: normalize(filename),
  deps: [...transitive_dependencies(filename)].map(normalize),
};

module.exports = { deps, example, view };
