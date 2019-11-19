import * as fs from "fs";
import * as path from "path";
import { dot_updater } from "@def.codes/node-web-presentation";
import { object_graph_to_dot } from "@def.codes/graphviz-format";
import { make_interpreter } from "./interpreter";
import { filesystem_watcher_source } from "@def.codes/process-trees";
import * as rs from "@thi.ng/rstream";

function main() {
  const [, , module_name] = process.argv;
  const filename = path.join(process.cwd(), `${module_name}.js`);

  if (!fs.existsSync(filename)) {
    console.error(`No such module ${module_name}`);
    process.exit(0);
  }

  const interpreter = make_interpreter(filename);
  const updater = dot_updater();

  function do_interpret() {
    const code = fs.readFileSync(filename, "utf8");
    const things = interpreter.interpret(code);
    updater.go(object_graph_to_dot(things));
  }

  // Watch
  rs.stream(filesystem_watcher_source(filename)).subscribe({
    next: msg => {
      if (msg.type === "change") do_interpret();
    },
  });

  do_interpret();
}

main();
