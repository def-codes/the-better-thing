import * as fs from "fs";
import * as path from "path";
import { make_interpreter } from "./interpreter";

function main() {
  const [, , module_name] = process.argv;
  const filename = path.join(process.cwd(), `${module_name}.js`);

  if (!fs.existsSync(filename)) {
    console.error(`No such module ${module_name}`);
    process.exit(0);
  }
  make_interpreter(filename);
}

main();
