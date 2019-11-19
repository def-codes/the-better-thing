import * as fs from "fs";
import * as path from "path";
import { read } from "@def.codes/expression-reader";
import { object_graph_to_dot } from "@def.codes/graphviz-format";
import { dot_updater } from "@def.codes/node-web-presentation";
import { filesystem_watcher_source } from "@def.codes/process-trees";
import * as rs from "@thi.ng/rstream";

function main() {
  const [, , module_name] = process.argv;
  const filename = path.join(process.cwd(), `${module_name}.js`);

  if (!fs.existsSync(filename)) {
    console.error(`No such module ${module_name}`);
    process.exit(0);
  }

  const updater = dot_updater();

  function do_interpret() {
    const code = fs.readFileSync(filename, "utf8");

    let statements;
    try {
      // We *could* use a VM with a Proxy as context, but expression reader
      // isn't factored for that and this works fine.
      statements = read(code);
    } catch (error) {
      statements = { error, when: "reading-code" };
    }

    updater.go(object_graph_to_dot(statements));
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
