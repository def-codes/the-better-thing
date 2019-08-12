// Mostly dedicated to anonymous define support, which we may consider a
// *special case* (yet where most of the complication arises).
import { AMDFactory, AMDDefineFunction, AMDGlobals } from "./api";
import {
  ModuleResolver,
  ModuleNameResolver,
  ModuleDefinition,
  ModuleContext,
} from "./types";
import { AsyncMap } from "./AsyncMap";
import { memo_map } from "./memo_map";
import { load_script } from "./load_script";
import { default_resolver } from "./name-resolution";

// BOTH launches fetch for dependencies and executes factories.  You can't
// decouple these as long as a module may assume the side-effects of one of its
// dependencies.
const construct = async (
  needs: readonly string[],
  factory: AMDFactory,
  resolve: ModuleResolver
) => {
  const exports = {};
  const local = { exports };
  let imports: any[];

  const load = id => {
    const val = resolve(id);
    return val instanceof Promise
      ? val.catch(error => {
          throw new Error(`Couldn't load ${id} for something`);
        })
      : val;
  };

  try {
    // Run all this even if `exports` is used, for possible side-effects
    imports = await Promise.all(needs.map(id => local[id] || load(id)));
  } catch (error) {
    throw new Error(
      `Could not load dependencies for something ` + error.message
    );
  }

  /** “If the factory argument is an object, that object should be assigned as
   * the exported value of the module.”
   * https://github.com/amdjs/amdjs-api/blob/master/AMD.md#factory- */
  const module = typeof factory === "function" ? factory(...imports) : factory;
  return needs.includes("exports") ? exports : module;
};

export const make_loader = (resolver = default_resolver): AMDGlobals => {
  // The stack is used to coordinate with the script.
  //
  // The stack is local to this instance of require.  But it could well be
  // global.  Indeed, nothing is gained by scoping it to this instance, as
  // `define` calls in exotic modules will be made against the global scope, and
  // they will all get the same global `define`.
  const defines: ModuleDefinition[] = [];

  // A dictionary of loaded modules by their resolved URL's.
  const modules = new AsyncMap<string, ModuleContext>();

  // EFFECT
  // The `load_script` call changes the state of the VM.  If the script loads,
  // it will execute, including any define/require calls. Generally, any effect
  // from the execution of external scripts is unknowable to us.  But for AMD
  // modules, `define` and `require` serve as rendez-vouz points.  Each call to
  // `define` pushes its execution context onto a stack.  When that's done, the
  // last `define` should be from the script, which we follow synchronously.

  // Fetch a script and associate its URL with what should be its request context.
  // `defines` is taken from the enclosing context.
  // it must be a "fluent" or this trick can't work.
  //
  // What about the module resolution rules... can they change retroactively?
  //
  // url should be richer... it should be a context and able to include
  // e.g. how the URL was resolved.
  async function fetch_module(url: string): Promise<ModuleContext> {
    await load_script(url);
    if (!defines.length) throw Error(`Expected a define for ${url}`);
    return { ...defines[defines.length - 1], url };
  }

  function require_with(resolver: ModuleNameResolver) /*: AMDRequire*/ {
    const load_module = async (url: string) => {
      // EFFECT, sort of.  fetching a module SHOULD NOT have side effects
      const context = await fetch_module(url);
      const { needs, factory } = context,
        // EFFECT: factory may trigger effects (including more loads)
        module = await construct(needs, factory, require_relative(url));
      return { ...context, url, module };
    };

    const require_absolute = memo_map(modules, load_module).get;

    const require_relative = (base: string | null) => (name: string) =>
      Promise.resolve(resolver(name, base)).then(require_absolute);

    return Object.assign(
      // side-effects only
      (needs, factory) => construct(needs, factory, require_relative(null)),
      { modules, defines, async: require_relative(null) }
    );
  }

  return {
    require: require_with(resolver),
    define: Object.assign(
      ((a, b, c) => {
        const [given_name, needs, factory] =
          typeof a === "string" ? [a, b, c] : [undefined, a, b];

        const context = { given_name, needs, factory };

        // It's possible for a define *not* to have been loaded by a separate
        // script.  In such cases, we expect the name to be present.  In
        // principle, the loading context would be that of the "current" script,
        // however, we have (to wit) no way to know that here.  Which is
        // strange, because we do all this bookkeeping with context, and some of
        // that is (or could be) in scope here.

        if (given_name)
          construct(needs, factory, require_with(resolver).async).then(module =>
            modules.set(given_name, { ...context, url: null })
          );
        else defines.push(context);
      }) as AMDDefineFunction,
      { amd: {} }
    ),
  };
};
