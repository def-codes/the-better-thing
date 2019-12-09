import * as fs from "fs";
import * as vm from "vm";
import * as rs from "@thi.ng/rstream";
import { module_graph_watcher } from "./graph-watcher/module-graph-watcher";
import { make_display } from "@def.codes/node-web-presentation";

export async function module_host(
  module_name: string,
  op = "exports",
  state: object = {}
) {
  // transitional
  const display = make_display();

  // Not sure about including reference to state, just playing around
  const meld = { hosted_module: { name: module_name, state } };

  // const encountered_dependencies = new Set();
  const resolve_options = { paths: [process.cwd()] };
  const module_file = require.resolve(module_name, resolve_options);

  // Assume for now that we need the module file to exist up front.
  if (!fs.existsSync(module_file)) {
    console.error(`No such module ${module_name}`);
    process.exit(0);
  }

  /*
  const _require = (id: string) => {
    const resolved = require.resolve(id, resolve_options);
    encountered_dependencies.add(resolved);
    console.log(`encountered_dependencies`, encountered_dependencies);

    delete require.cache[resolved];
    return require(resolved);
  };

  const vm_context = vm.createContext({
    require: _require,
  });

  const fake_require = (_id: string) => {
    return vm.runInNewContext(`require("${module_name}")`, vm_context);
  };
  */
  Object.assign(globalThis, { state, display, meld });

  // This doesn't *have* to be an egress, but for the moment we're not
  // interested in exports.  That is, it's not a way that the module can use to
  // communicate with the system.  Rather, the module can import interpreters
  // directly.
  function show_exports() {
    let exported: any;
    try {
      // exported = fake_require(module_name);
      exported = require(module_file);
    } catch (error) {
      console.log(`error`, error);

      exported = { error, when: "loading-code" };
    }
  }

  const watcher = module_graph_watcher(module_file);

  // watcher.any_invalidated.subscribe(rs.trace("INVALID!"));

  watcher.main_invalidated.subscribe({
    next() {
      show_exports();
    },
  });

  show_exports();
}
