import * as vm from "vm";
import * as fs from "fs";
import * as path from "path";

const target = {};
const proxy = new Proxy(target, {
  get(_target, key, _receiver) {
    console.log(`get`, key);
  },
});

const [, , module_name] = process.argv;
console.log(`module_name`, module_name);
const filename = path.join(process.cwd(), `${module_name}.js`);
console.log(`filename`, filename);

if (!fs.existsSync(filename)) {
  console.error(`No such module ${module_name}`);
  process.exit(0);
}

const context = vm.createContext(proxy);
const code = fs.readFileSync(filename, "utf8");

vm.runInContext(code, context, {});
