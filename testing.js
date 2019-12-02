const some_lib = require("./some-lib");
const { filesystem_watcher_source } = require("@def.codes/process-trees");
const { join, basename, dirname } = require("path");
const { depth_first_walk } = require("@def.codes/graphviz-format");
const rs = require("@thi.ng/rstream");
const tx = require("@thi.ng/transducers");
const {
  transitive_dependencies,
  transitive_dependents,
  transitive_invalidate,
} = require("@def.codes/node-live-require");
const { map_object } = require("@def.codes/helpers");
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

const watcher = rs.stream(
  filesystem_watcher_source(prefix, { recursive: true })
);

const JS = /\.js$/gi;

// watcher
//   .transform(tx.filter(_ => JS.test(_.path)))
//   .transform(tx.map(_ => _.path))
//   .subscribe(rs.trace("BLAH DEE BLAH"));

const delay = 100;

watcher
  .transform(
    tx.filter(_ => {
      const good = typeof _.path === "string";
      if (!good) console.warn("Unexpected value for path:", _.path);
      return good;
    }),
    // tx.trace("BOUNCE"),
    tx.map(_ => join(_.context, _.path)),
    tx.filter(filename => filename in require.cache),
    tx.throttle(() => {
      // Adapted from throttle time to debounce only for identical values
      // at least I think that's what this does
      let last_time = 0,
        last_value;
      return v => {
        const t = Date.now();
        return last_value !== v && t - last_time >= delay
          ? (((last_time = t), (last_value = v)), true)
          : false;
      };
    }),
    tx.sideEffect(filename => {
      transitive_invalidate(filename, require);
    })
  )
  .subscribe(rs.trace("INVALIDATED!!"));

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

console.log(`some_lib`, some_lib);

module.exports = {
  graph,
  view,
  example,
  some_lib,
};
