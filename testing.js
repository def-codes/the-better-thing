const { join, basename, dirname } = require("path");
// const { depth_first_walk } = require("@def.codes/graphviz-format");
const tx = require("@thi.ng/transducers");
const { transitive_dependencies } = require("@def.codes/node-live-require");
// const { map_object } = require("@def.codes/helpers");
// const pt = require("@def.codes/graphviz-format");

// if the arrows pointer the other way, this would just be an exhaustive walk
function* transitive_dependents(filename, cache = require.cache) {
  // reverse index & do traversal
}

// [
//       ...depth_first_walk([require.cache[require.resolve("ws")]], {
//         spec: { links_from: _ => _.children.map((x, i) => [i, x]) },
//       }),
//     ]
//       .filter(x => x.value instanceof Module)
//       .map(x => x.value.filename)

const transitive_invalidate = (id, cache = require.cache) => {
  // const dependents =
  delete cache[id];
};

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

// const filename = require.resolve("./testing");
const filename = require.resolve("ws");
const example = {
  filename: normalize(filename),
  deps: [...transitive_dependencies(filename)].map(normalize).sort(),
};

module.exports = {
  deps,
  view,
  example,
  // stuff: {
  //   and_stuff: [
  //     ...depth_first_walk([require.cache[require.resolve("ws")]], {
  //       spec: { links_from: _ => _.children.map((x, i) => [i, x]) },
  //     }),
  //   ]
  //     .filter(x => x.value instanceof Module)
  //     .map(x => x.value.filename),
  // },
};
