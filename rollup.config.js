// Rollup JS bundler configuration.  https://rollupjs.org/#javascript-api

const TO_INLINE = {
  tslib: "node_modules/tslib/tslib.es6.js"
};

/** Modules involved in testing */
const TEST_MODULES = [];

/** Modules built in this project. */
const modules = [["expression-reader"], ["rdf-data-model"]];

// Unfortunately, rollup doesn't support wildcards for specifying externals.
const things = (
  "rstream rstream-graph rstream-csp transducers paths hdom dcons " +
  "iterators atom csp compose associative checks interceptors"
)
  .split(" ")
  .map(name => `thi.ng/${name}`);

/** Modules imported by this project. */
const imports = [...things];

// Our own modules are “external” when they are importing each other.
const external = [...imports, ...modules.map(([name]) => name)];

const globals = {};
external.forEach(name => (globals[name] = name));

const bundle = ([name, { standalone, split, dir, ...config } = {}]) => ({
  input: standalone
    ? `build/modules/${dir || name}.js`
    : `build/modules/${dir || name}/index.js`,
  external, // Suppress “Unresolved dependencies” warning.
  // Suppress warnings due to tslib. https://github.com/rollup/rollup/issues/794
  onwarn(warning) {
    if (warning.code === "THIS_IS_UNDEFINED") return;
    console.error(warning.message);
  },
  ...(config || {}),
  output: {
    name,
    format: "umd",
    ...(!(config && config.output && config.output.dir) &&
      (split ? { dir: `script/${name}` } : { file: `script/${name}.js` })),
    sourcemap: true,
    globals, // Suppress “Missing global variable names” warning
    ...((config && config.output) || {})
  },
  // Avoid `ENOSPC` issue on Linux. https://github.com/rollup/rollup/issues/1669
  watch: { include: "build/modules/**", chokidar: { usePolling: true } },
  plugins: [
    (function() {
      return {
        name: "meld-resolve",
        resolveId: includee => TO_INLINE[includee] || null
      };
    })()
  ]
});

export default modules.map(bundle);