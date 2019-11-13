// Create a persistent runtime and support outside interop through a module.
// Idea is that you call this program with a module name as an argument

import * as vm from "vm";
import * as fs from "fs";
import { join } from "path";
import * as rs from "@thi.ng/rstream";
import { filesystem_watcher_source } from "@def.codes/process-trees";

export const host = (module_name: string) => {
  console.log(`module_name`, module_name);

  const fullpath = require.resolve(process.cwd() + "/" + module_name);
  if (!fullpath) throw Error(`Couldn't resolve ${module_name}`);

  const str = rs.stream(
    filesystem_watcher_source(fullpath, { persistent: true })
  );
  // const context = vm.createContext({});

  function runit(filepath: string) {
    const code = fs.readFileSync(filepath, "utf8");
    const script = new vm.Script(code);
    console.log("RESULT", script.runInNewContext());
  }
  runit(fullpath);
  str.subscribe({
    next(msg) {
      console.log(`MESSAGE!`, msg);

      if (msg.path == null) {
        console.error(`Look at that, no filename! ${msg.type}`);
        return;
      }
      // should equal fullpath anyway
      // runit(join(msg.context, msg.path));
      runit(msg.context); // this is the whole filename
    },
  });
};
