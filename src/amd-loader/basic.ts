// Basic AMD support means named modules only.
// uses lazy define and eager require

import { AMDRequire, AMDFactory, AMDNamedDefineFunction } from "./api";
import { ModuleDefinition } from "./types";
import { AsyncMap } from "./AsyncMap";
import { memo_map } from "./memo_map";

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
  // const modules = memo_map(definitions, key => {
  // 	const def = get_definition_where_now
  // 	if (typeof def =
  // });

  const define = (
    id: string,
    dependencies: readonly string[] | AMDFactory,
    factory?: AMDFactory
  ) => {
    if (!Array.isArray(dependencies)) return define(id, [], dependencies);
    definitions.set(id, { given_name: id, needs: dependencies, factory });
  };

  const require = (
    deps: readonly string[] | AMDFactory,
    factory?: AMDFactory
  ) => {
    if (!Array.isArray(deps)) return require([], deps);
    // *now* resolve dependencies
    const imports = Promise.all(deps.map(definitions.get)).then(defs => {
      // cool, now you have these module definitions that have either been executed or haven't
    });
  };

  return { define, require };
};
