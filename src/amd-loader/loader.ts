import { AMDFactory, AMDRequire, AMDDefine, AMDDefineFunction } from "./api";
import { AsyncMap } from "./AsyncMap";
import { load_script } from "./load_script";

interface ModuleContext {
  readonly given_name: string | undefined;
  readonly needs: readonly string[];
  readonly factory: AMDFactory;
}

interface ModuleWithContext {
  readonly context?: ModuleContext;
  readonly module: any;
}

interface PendingModule {
  readonly context: ModuleContext;
  // Thunk that returns
  readonly promise: (require: AMDRequire) => Promise<any>;
}

const default_resolver = (name: string, base: string | null | undefined) => {
  if (/^(\w+:)|\/\//.test(name)) return name;
  if (/^[.]{0,2}\//.test(name))
    return new URL(name, base == null ? location.href : base).href;

  return name;
};

export const make_loader = (): { define: AMDDefine; require: AMDRequire } => {
  const stack: PendingModule[] = [];

  function require_from(resolver) {
    const modules = new AsyncMap<string, ModuleWithContext>();

    const require_absolute = async (
      url: string
    ): Promise<ModuleWithContext> => {
      if (modules.has(url)) return modules.get(url);

      await load_script(url);
      // The stack is used to coordinate with the script.  This should occur
      // synchronously after the script load, when its `define` should have been
      // the last one executed.
      if (!stack.length) throw Error(`Expected a define for ${url}`);
      const { context, promise } = stack.pop();
      const result = promise(require_relative(url));
      const module = await result;
      modules.set(url, { context, module });
      return { module };
    };

    const require_relative = base => name =>
      Promise.resolve(resolver(name, base))
        .then(require_absolute)
        .then(_ => _.module);

    const meet = (needs, factory) =>
      Promise.all(needs.map(require_relative(null))).then(
        imports => typeof factory === "function" && factory(...imports)
      );

    // side-effects only.  needs + factory or standalone factory
    return function require(a, b) {
      if (Array.isArray(a)) meet(a, b);
      else if (typeof a === "function") a();
    };
  }

  return {
    require: require_from(default_resolver),
    define: Object.assign(
      ((a, b, c) => {
        const [given_name, needs, factory] =
          typeof a === "string" ? [a, b, c] : [undefined, a, b];

        stack.push({
          context: { given_name, needs, factory },
          promise: require =>
            Promise.all(needs.map(require)).then(imports =>
              typeof factory === "function" ? factory(...imports) : factory
            ),
        });
      }) as AMDDefineFunction,
      { amd: {} }
    ),
  };
};
