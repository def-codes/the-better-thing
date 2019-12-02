// For reference... not used now but may be for dynamic require support
import * as fs from "fs";
import * as vm from "vm";
import { dirname } from "path";

// omfg node has this too
// https://nodejs.org/api/modules.html#modules_module_createrequire_filename
//
// What this does is... returns a function that looks and smells like Node
// require.  But it gives you a hook.
export const make_contextual_require = (from_module: string) => {
  const from_path = "blah";
  return module_id => {
    const fullpath = require.resolve(module_id, { paths: [from_path] });
    const code = fs.readFileSync(fullpath, "utf-8");
    const exports = {};
    const module = { exports };
    const __filename = "wut";
    const __dirname = dirname(__filename);
    const _require = Object.assign(
      function require(id) {
        // hook here
      },
      {
        cache: {},
        resolve: (id, paths) => {
          require.resolve(id, paths);
        },
      }
    );
    const context = vm.createContext({
      require: _require,
      module,
      exports,
      __filename,
      __dirname,
    });
    vm.runInContext(code, context);
    return exports;
  };
};
