const deps = [
  "./css.js",
  "./dataflow.js",
  "./dom-node.js",
  "./files-and-directories.js",
  "./modules.js",
  "./mouse-events.js",
  "./state-machine.js",
];
define(deps, (...modules) => {
  return Object.fromEntries(deps.map((id, i) => [id, modules[i]]));
});
