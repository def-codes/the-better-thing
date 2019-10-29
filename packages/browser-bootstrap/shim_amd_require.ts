/** Shim RequireJS in the current browsing context to support dynamic modules.
 *
 * Assumes require has already been loaded.  Supports some, but not all AMD
 * features.  The AMD specification is at
 * https://github.com/amdjs/amdjs-api/blob/master/AMD.md
 *
 * Assumes Proxy is supported.
 */
import { deep_proxy } from "./deep_proxy";

declare global {
  interface Window {
    redefine_module: (module_id: string, code: string) => Promise<object>;
  }
}

declare var window;

/** Create a function that acts like an AMD `define` but that calls the given
 * callback with the module's exports. */
const define_then = (resolve, remap = _ => _) =>
  Object.assign(
    (raw_dependencies, factory) => {
      const dependencies = raw_dependencies.map(remap);
      // Here we need to remap dependencies relative to the thing being defined.
      return window.require(dependencies, (...args) => {
        return resolve(make_fake_factory({ dependencies, factory })(...args));
      });
    },
    { amd: true } // for UMD loader
  );

/* Proxy require */

/** Wrap a RequireJS instance to allow pre-processing of arguments. */
const advise_require = (target, preprocess) =>
  new Proxy(target, {
    apply(target, thisArg, args) {
      // AMD supports two `define` signatures.  The form with “given name” is
      // seldom used now; TypeScript does not emit it for AMD or UMD output.
      const [first, second, third] = args;
      let [given_name, dependencies, factory] = Array.isArray(first)
        ? [undefined, first || [], second]
        : [first, second || [], third];

      const real = { dependencies, factory };
      const fake = { ...real, ...preprocess(real) };

      return target.apply(
        thisArg,
        [given_name, fake.dependencies, fake.factory].slice(given_name ? 0 : 1)
      );
    },
  });

const make_fake_factory = (spec, resolve = (_, __) => null) => (...args) => {
  const { factory, dependencies } = spec;
  const exports = {};
  const special = { exports };
  const imports = args.map(
    (arg, i) => special[dependencies[i]] || resolve(dependencies[i], arg) || arg
  );
  const result = factory(...imports);
  return dependencies.includes("exports") ? exports : result;
};

/** Wrap a RequireJS instance to inject hot-loading plugin for dependencies. */
const hot_proxy_require = (
  target,
  keep_cold: (id: string) => boolean,
  hotwire: Function
) =>
  advise_require(target, ({ dependencies, factory }) => ({
    // All but specially-designated modules will be first routed through the
    // “hot” plugin, which resolves the module to a persistent deep proxy.  We
    // can't do that here because the imports are not resolved yet (so we
    // can't call the factory), and we don't know the name of the current
    // module (so we couldn't cache the proxies).
    dependencies: (dependencies || []).map(
      dep => (keep_cold(dep) ? "" : "hot!") + dep
    ),
    factory: make_fake_factory({ factory, dependencies }, (key, actual) => {
      // In AMD, you can get a CommonJS-like loader by declaring `require` as a
      // dependency.  The provided `require` will take a single string argument
      // and synchronously return the pre-resolved module.  This is used by
      // "UMD" modules to support both environments.  Significantly, the
      // `require` that is supplied here is *not* the proxied one, hence this.
      if (key === "require" && typeof actual === "function")
        return (id, ...rest) => {
          const result = actual(id, ...rest);
          if (typeof id === "string") return hotwire(actual.toUrl(id), result);
          return result;
        };

      return actual;
    }),
  }));

/** List the module id's that are to be considered external.
 *
 * The implementation is arbitrary and depends on undocumented RequireJS's
 * internals.  It just returns the names of modules for which a path mapping is
 * configured.  Require's `paths` config can be used for any modules, including
 * your own; we just happen to use it for externals.  May need to support a more
 * explicit approach at some point.
 */
function get_externals() {
  try {
    const config_paths = window["require"].s.contexts._.config.paths;
    return Object.keys(config_paths);
  } catch (_) {
    console.warn("missing RequireJS config", require);
  }
  return [];
}

/* Init */

/** Mutate window's AMD loader functions to support hot loading. */
function init_hot_loading({ keep_cold }) {
  // Use a deep proxy to serve as a dictionary of proxies with dynamic targets.
  const proxied_modules = deep_proxy();
  // This function always returns an identical proxy for each key.  The second
  // part of the comma operator looks redundant here, but the proxy getter
  // doesn't return the same thing that's assigned to it.
  const hotwire = (name, target) => (
    (proxied_modules[name] = target), proxied_modules[name]
  );

  // Assign a new source-code definition to the module with the given
  // (non-relative) id.  Assumes module uses a `define` call.
  window.redefine_module = (id, code) =>
    // Create a function with the same source code as the module, except that we
    // can pass our own `define` as the first argument, giving us the chance to
    // capture the new module.
    new Promise(resolve => {
      const fake = define_then(resolve, _ => {
        const is_relative = /^(\.|\/)/.test(_);
        let proposed = is_relative ? id.replace(/[^\/]+$/, _) : _;
        // HACK: hardcoded
        proposed = proposed.replace(/^\/dist\/umd\//, "");
        return proposed;
      });
      return new Function("define", "require", code)(fake, fake);
    })
      .catch(e => console.error("Problem getting new module", id, e, code))
      .then(cold => hotwire(window.requirejs.toUrl(id), cold))
      .catch(e => console.error("Problem injecting new module", id, e));

  // Create a (stateful) little RequireJS plugin that intercepts module loads to
  // provide proxied module exports instead
  window.define("hot", {
    load(id, _require, onload) {
      _require([id], cold => onload(hotwire(_require.toUrl(id), cold)));
    },
  });

  window.require = hot_proxy_require(window.require, keep_cold, hotwire);
  window.define = hot_proxy_require(window.define, keep_cold, hotwire);
}

export function shim_amd_require() {
  // The hot loading approach breaks some modules.  For example, Babel's
  // implementation emits a `_classCallCheck` that does a reference test between
  // the internal and external versions of the constructor.  As noted in
  // `deep_proxy`, this doesn't work with proxied objects.  In any case, there's
  // no use proxying externals, since they won't change at runtime.
  init_hot_loading({
    keep_cold: (ids => id => ids.includes(id))(
      ["exports", "require", "hot", "deep_proxy", "is_builtin"].concat(
        get_externals()
      )
    ),
  });
}
