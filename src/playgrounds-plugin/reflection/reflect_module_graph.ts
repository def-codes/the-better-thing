// I ain't a part of your system!  Maaaaaan!
/*
import * as ts_module from "typescript/lib/tsserverlibrary";
import {
  dependency_grapher,
  DependencyGraph,
} from "../node/typescript_module_graph";
import { Channel } from "../csp/channels";
import { GeneratorProcess } from "../csp/system";

// For the given program, put a dependency graph on the output channel for each
// entry point sent to the input channel.  The program is an external
// representing a changing model, so the same input may yield different outputs.

export const module_graph: GeneratorProcess = function* module_graph(
  ts: typeof ts_module,
  options: ts.CompilerOptions,
  input: Channel<string>,
  output: Channel<DependencyGraph>
) {
  const grapher = dependency_grapher(ts, options);
  for (;;) yield this.put(output, grapher(yield this.take(input)));
};
*/
