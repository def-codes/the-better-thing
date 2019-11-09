// Rollup JS bundler configuration.  https://rollupjs.org/#javascript-api

const TO_INLINE = {
  tslib: "node_modules/tslib/tslib.es6.js",
};

/** Modules involved in testing */
const TEST_MODULES = [];

/** Modules built in this project. */
const modules = [
  ["amd-loader"],
  ["browser-bootstrap"],
  ["console-stream"],
  ["datafy-nav"],
  ["datafy-node", { node_only: true }],
  ["expression-reader"],
  ["function-testing"],
  ["graphviz-format"],
  ["helpers"],
  ["meld-core"],
  ["meld-demo"],
  ["meld-process"],
  ["node-viewer-cli", { node_only: true }],
  ["node-web-presentation", { node_only: true }],
  ["playgrounds-plugin", { node_only: true }],
  ["playgrounds-plugin-client"],
  ["polymorphic-functions"],
  ["polymorphic-hdom"],
  ["process-trees"],
  ["rdf-data-model"],
  ["rdf-expressions"],
  ["rdf-expressions-test"],
  ["simple-http-server", { node_only: true }],
];

// Unfortunately, rollup doesn't support wildcards for specifying externals.
const things = (
  "rstream rstream-graph rstream-csp transducers paths hdom dcons " +
  "iterators atom csp compose associative checks interceptors rstream-query " +
  "transducers-hdom defmulti hiccup-markdown fsm equiv diff"
)
  .split(" ")
  .map(name => `@thi.ng/${name}`);

// You might expect rollup to automatically treat these as externals.
const node_builtins = ["child_process", "fs", "http", "path", "url", "util"];
const node_imports = ["ws", "typescript/lib/tsserverlibrary"];

/** Modules imported by this project. */
const imports = [...things, ...node_builtins, ...node_imports];

// Our own modules are “external” when they are importing each other.
const external = [...imports, ...modules.map(([name]) => `@def.codes/${name}`)];

const globals = {};
external.forEach(name => (globals[name] = name));

const bundle = ([name, { node_only, ...config } = {}]) => ({
  input: `build/modules/${name}/index.js`,
  external, // Suppress “Unresolved dependencies” warning.
  // Suppress warnings due to tslib. https://github.com/rollup/rollup/issues/794
  onwarn(warning) {
    if (warning.code === "THIS_IS_UNDEFINED") return;
    console.error(warning.message);
  },
  ...(config || {}),
  output: {
    name,
    format: node_only ? "cjs" : "umd",
    ...(!(config && config.output && config.output.dir) && {
      file: `node_modules/@def.codes/${name}.js`,
    }),
    sourcemap: true,
    globals, // Suppress “Missing global variable names” warning
    ...((config && config.output) || {}),
  },
  // Avoid `ENOSPC` issue on Linux. https://github.com/rollup/rollup/issues/1669

  // UPDATE: This requires another package and no longer solves the issues,
  // anyway.  I'm now working around this on Linux by bumping the system cap on
  // the number of watchers.
  //
  //watch: { include: "build/modules/**", chokidar: { usePolling: true } },
  plugins: [
    (function() {
      return {
        name: "meld-resolve",
        resolveId: includee => TO_INLINE[includee] || null,
      };
    })(),
  ],
});

export default modules.map(bundle);
