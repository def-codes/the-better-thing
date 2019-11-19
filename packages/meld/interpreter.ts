import * as vm from "vm";
import * as fs from "fs";
import { make_thing } from "./thing";

export const make_interpreter = (filename: string) => {
  const things = {};
  const target = {};
  const proxy = new Proxy(target, {
    get(_target, key, _receiver) {
      console.log(`INTERPRETER get`, key);
      const thing = things[key] ?? (things[key] = make_thing());
      return thing;
    },
  });

  const context = vm.createContext(proxy);
  const code = fs.readFileSync(filename, "utf8");

  vm.runInContext(code, context, {});
};
