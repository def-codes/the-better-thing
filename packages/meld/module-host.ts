import * as fs from "fs";
import * as vm from "vm";
import { filesystem_watcher_source } from "@def.codes/process-trees";
import * as rs from "@thi.ng/rstream";

const timeout = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function module_host(module_name: string, op = "exports") {
  const encountered_dependencies = new Set();
  const resolve_options = { paths: [process.cwd()] };
  const module_file = require.resolve(module_name, resolve_options);

  // Assume for now that we need to module file to exist up front.
  if (!fs.existsSync(module_file)) {
    console.error(`No such module ${module_name}`);
    process.exit(0);
  }

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

  // This doesn't *have* to be an egress, but for the moment we're not
  // interested in exports.  That is, it's not a way that the module can use to
  // communicate with the system.  Rather, the module can import interpreters
  // directly.
  function show_exports() {
    let exported: any;
    try {
      exported = fake_require(module_name);
    } catch (error) {
      console.log(`error`, error);

      exported = { error, when: "loading-code" };
    }

    // What to do with this?  Or do we even care about exports?
    // Right.  No, we don't
    // We can't, this has to be an egress.

    // graph_it(exported, exported.view);
  }

  // Watch
  await timeout(1000);
  // disable interpret for now
  const fn = op === "exports" ? show_exports : () => {}; // do_interpret;
  rs.stream(filesystem_watcher_source(module_file)).subscribe({
    next: msg => {
      if (msg.type === "change") fn();
    },
  });

  fn();
}
