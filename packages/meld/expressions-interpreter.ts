// This was for the declarative module approach, which can't be used
// simultaneously with the plain-eval approach.
import * as fs from "fs";
import { read } from "@def.codes/expression-reader";
import { interpret } from "./interpreter";
import { make_grapher } from "./graph-it";

export function do_interpret(module_file: string) {
  const graph_it = make_grapher();
  const context = {};
  const code = fs.readFileSync(module_file, "utf8");

  let statements;
  try {
    // We *could* use a VM with a Proxy as context, but expression reader
    // isn't factored for that and this works fine.
    statements = read(code);
  } catch (error) {
    statements = { error, when: "reading-code" };
  }

  let result;
  try {
    result = interpret(statements, context);
  } catch (error) {
    result = { error, when: "interpreting-statements" };
  }

  graph_it({ statements, result });
}
