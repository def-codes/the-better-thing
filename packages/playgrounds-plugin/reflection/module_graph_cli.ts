/** Entry point for starting a module-structure reading process. */
/*
const initial_entry_point = process.argv[2];
import { dependency_grapher } from "./typescript_module_graph";
import { System, GeneratorProcess, SystemSink, Channel } from "mindgrub";

function sink(message) {
  // `send` is undefined if this is not a forked process
  if (process.send) process.send(message);
}

const grapher = dependency_grapher();

const graph_entry_points: GeneratorProcess = function* take_process(
  entry_points: Channel<string>
) {
  for (;;) {
    const entry_point = yield this.take(entry_points);
    const graph = grapher(entry_point);
    sink({ graph });
  }
};

const system_sink: SystemSink = (pid, message) =>
  true || sink({ pid, message });
const entry_point_channel = new Channel(1);
new System(graph_entry_points, [entry_point_channel], system_sink);

process.on("message", message => {
  entry_point_channel.put(message);
});

entry_point_channel.put(initial_entry_point);
*/
