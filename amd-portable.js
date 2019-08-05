// shim an AMD loader so that
//
// Describe the process whereby an external AMD module (that knows nothing about
// this) can be inlined along with its dependencies.
//
// In hosted mode, you can fetch the source of scripts (e.g .from script/@src)
//
// If you shim the AMD loader, then you can access the factory function and get
// its source that way.  You would then have to construct a `define` call that
// defined the module along with its dependencies.
//
// In standalone mode, you can't get get the source of external scripts.
// (or so it appears)
//
// Presumably this would have to be loaded after an AMD loader is in scope and
// before any modules have been loaded (at least, it can't work on
// already-loaded modules).
function make_amd_loader_portable(require, define) {
  console.log(`require`, require);
  console.log(`define`, define);
  const shimmed_require = (...args) => {
    // problem is associating the module id
    const required = require(...args);
    console.log(`REQUIRE!`, required, " -> ", ...args);
    return required;
  };
  window.require = shimmed_require;
}

make_amd_loader_portable(require, define);
