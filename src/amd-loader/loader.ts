import { AMDFactory, AMDDefineFunction, AMDGlobals, MaybeAsync } from "./api";
import { AsyncMap } from "./AsyncMap";
import { memo_map } from "./memo_map";
import { load_script } from "./load_script";

interface ModuleLoadingContext {
  readonly url: string;
}

interface ModuleExecutionContext {
  readonly given_name: string | undefined;
  readonly needs: readonly string[];
  readonly factory: AMDFactory;
}

interface ModuleContext extends ModuleLoadingContext, ModuleExecutionContext {}

interface ModuleWithContext extends ModuleContext {
  readonly module: object;
}

type RequireAbsolute = (url: string) => MaybeAsync<ModuleWithContext>;
type ModuleResolver = (id: string) => MaybeAsync<object>;

type ModuleNameResolver = (
  name: string,
  base?: string | null
) => MaybeAsync<string>;

/*
http://wiki.commonjs.org/wiki/Modules/1.1.1#Module_Identifiers

1. A module identifier is a String of "terms" delimited by forward slashes.

2. A term must be a camelCase identifier, ".", or "..".

3. Module identifiers may not have file-name extensions like ".js".

4. Module identifiers may be "relative" or "top-level". A module identifier is
   "relative" if the first term is "." or "..".
*/
const IS_RELATIVE = /^[.][.]?\//;
const is_relative = id => IS_RELATIVE.test(id);

/*
5. Top-level identifiers are resolved off the conceptual module name space root.

6. Relative identifiers are resolved relative to the identifier of the module in
   which "require" is written and called.
*/

export const default_resolver: ModuleNameResolver = (
  name: string,
  base?: string | null
) => {
  if (/^(\w+:)|\/\//.test(name)) return name;
  if (/^[.]{0,2}\//.test(name))
    return new URL(name, base == null ? location.href : base).href;

  return name;
};

const construct = async (
  needs: readonly string[],
  factory: AMDFactory,
  resolve: ModuleResolver
) => {
  /** “If the factory argument is an object, that object should be assigned as
   * the exported value of the module.”
   * https://github.com/amdjs/amdjs-api/blob/master/AMD.md#factory- */
  if (typeof factory !== "function") return factory;

  const exports = {};
  const local = { exports };
  // Run all this even if `exports` is used, for possible side-effects
  const imports = await Promise.all(needs.map(id => local[id] || resolve(id)));
  const module = factory(...imports);
  return needs.includes("exports") ? exports : module;
};

export const make_loader = (resolver = default_resolver): AMDGlobals => {
  // The stack is used to coordinate with the script.
  const define_stack: ModuleExecutionContext[] = [];

  // A dictionary of loaded modules by their resolved URL's.
  const modules = new AsyncMap<string, ModuleWithContext>();

  function require_with(resolver: ModuleNameResolver) /*: AMDRequire*/ {
    // EFFECT
    async function load_module(url: string): Promise<ModuleWithContext> {
      // EFFECT
      // If the script loads, it will execute, including any define/require calls.
      await load_script(url);

      // That load changes the state of the VM.  Generally, any effect from the
      // execution of external scripts is unknowable to us.  But for AMD
      // modules, `define` and `require` serve as rendez-vouz points.
      // Each call to `define` pushes its execution context onto a stack.

      // Last `define` should be from the script, which we follow synchronously.
      if (!define_stack.length) throw Error(`Expected a define for ${url}`);

      // Now *we* change the state.
      //
      // The stack is local to this instance of require.  But it could well be
      // global.  Indeed, nothing is gained by scoping it to this instance, as
      // `define` calls in exotic modules will be made against the global
      // scope, and they will all get the same global `define`.

      // EFFECT: mutating loader-level execution context.
      //
      // This in particular is non-monotonic.  It's still not 100% clear to me
      // in what circumstances a nested context could exist.
      const context = define_stack[define_stack.length - 1], //.pop(),
        { needs, factory } = context,
        // EFFECT: the constructor may trigger effects (including loads)
        module = await construct(needs, factory, require_relative(url));

      return { ...context, url, module };
    }

    const require_absolute = memo_map(modules, load_module).get;

    const require_relative = (base: string | null) => (name: string) =>
      Promise.resolve(resolver(name, base))
        .then(require_absolute)
        .then(_ => _.module);

    return Object.assign(
      // side-effects only
      (needs, factory) => construct(needs, factory, require_relative(null)),
      { modules, define_stack, async: require_relative }
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
          construct(needs, factory, require_with(resolver).async(null)).then(
            module => modules.set(given_name, { ...context, url: null, module })
          );
        else define_stack.push(context);
      }) as AMDDefineFunction,
      { amd: {} }
    ),
  };
};
