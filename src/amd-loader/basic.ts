// Basic AMD support means named modules only.
// uses lazy define and eager require

import { AMDRequire, AMDFactory, AMDNamedDefineFunction } from "./api";
import { ModuleDefinition } from "./types";
import { AsyncMap } from "./AsyncMap";
import { memo_map } from "./memo_map";
import { amd_construct } from "./amd-construct";

interface AMDGlobals {
  define: AMDNamedDefineFunction;
  require: AMDRequire;
}

export const make_define_basic = (): AMDGlobals => {
  // set up state / context

  // A dictionary of module definitions by their (canonical??) ID.
  // I mean, what do you even do with this?
  //
  // It's not entirely clear from this why this is async
  const definitions = new AsyncMap<string, ModuleDefinition>();
  const modules = memo_map(definitions, key => {
    // const def = get_definition_where_now
    // if (typeof def =
    return {};
  });

  // Lazy: just register
  const define = (
    id: string,
    needs: readonly string[] | AMDFactory,
    factory?: AMDFactory
  ) => {
    if (!Array.isArray(needs)) return define(id, [], needs);
    definitions.set(id, { given_name: id, needs, factory });
  };

  // Eager: evaluate now
  const require: AMDRequire = (needs, factory) => {
    // resolve dependencies
    Promise.all(needs.map(definitions.get)).then(defs => {
      const imports = {};
      for (const def of defs)
        imports[def.given_name] = modules.get(def.given_name);

      amd_construct({ needs, factory }, { imports });
    });
  };

  return { define, require };
};
