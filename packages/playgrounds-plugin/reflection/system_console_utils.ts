/** Tools for monitoring a system's output from the console (if you must). */

import * as util from "util";
import { Process } from "../csp/index";

const WIDTH = process.stdout.columns || 70;

const default_format = o => util.format(o).substring(0, 60) + "...";

const replacer = (max_length => (_k, v) => {
  if (typeof v === "string" && v.length > max_length)
    return `${v.slice(0, max_length - 3)}...`;
  return v;
})(Math.floor(WIDTH * 0.7)); // account for keys

export const pretty_print = (o, _depth = 0) =>
  util.inspect(JSON.parse(JSON.stringify(o, replacer, 2)), {
    depth: 5,
    colors: true,
  });

interface TextSinkOptions {
  format?;
  sink_ouput?: (message: string) => void;
  sink_error?: (message: string) => void;
}

const write_stdout = message => process.stdout.write(message);
//const write_stderr = message => process.stderr.write(message);

/** Write system messages as formatted text. */
export const make_text_sink = (options?: TextSinkOptions) => {
  const processes = new Array<Process>(64);
  const format = (options && options.format) || default_format;
  const write_output = (options && options.sink_ouput) || write_stdout;
  const write_error = (options && options.sink_error) || write_output;

  return (pid, message) => {
    try {
      const { spawned } = message;
      if (spawned != null && spawned.pid) processes[spawned.pid] = spawned;
      const proc_name = processes[pid] && processes[pid].fn;
      write_output(
        pid.toString() + (proc_name ? ` ${proc_name} says ` : "") + "\n"
      );
      write_output(format(message) + "\n\n");
    } catch (error) {
      write_error("Error logging message: " + error);
    }
  };
};
