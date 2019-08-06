// when AMD dependencies are loaded,
// ensure that they are stored (retrievably) in the document
//
// I don't think it's possible to shim a generic AMD loader in a way that
// captures the dependency tree.

//
// Describe the process whereby an external AMD module (that knows nothing about
// this) can be inlined along with its dependencies.

// In hosted mode, you can fetch and inline the source of scripts (e.g .from
// script/@src).
//
// ^ but how do you know that it isn't pointing to an AMD module?  If it is,
// then you'll get the anonymous define error.
//
// In standalone mode, you can't get get the source of external scripts.
//
// This must be loaded after an AMD loader is in scope and before any modules
// have been loaded (at least, it can't work on already-loaded modules).

const amd_define_code = (name, dependencies, factory_code) =>
  `define("${name}", ${JSON.stringify(dependencies)}, ${factory_code})`;

// uses attribute (`data-amd-module`) to identify what module is being provided.
// assumes one module per script

const ensure_amd_module = (
  module_name,
  dependencies,
  factory,
  container = document.body
) => {
  const selector = `script[data-amd-module="${module_name}"]`;
  const existing_element = document.querySelector(selector);
  if (!existing_element) {
    const new_script = document.createElement("script");
    new_script.setAttribute("data-amd-module", module_name);
    container.appendChild(new_script);
  }
  const factory_code = factory.toString();
  // const dependencies = ["@thi.ng/transducers"]; // example
  const code = amd_define_code(module_name, dependencies, factory_code);
};

function make_amd_loader_portable(require, define) {
  console.log(`require`, require);
  console.log(`define`, define);
  const shimmed_require = (...args) => {
    // problem is associating the module id
    const required = require(...args);
    console.log(`REQUIRE!`, required, " -> ", ...args);
    // Here we can log the fact that “this” module has these dependencies.  But
    // how do we know what the module id is?  The only way I've been able to do
    // this is through
    return required;
  };
  window.require = shimmed_require;
}

make_amd_loader_portable(require, define);