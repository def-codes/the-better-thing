import * as dot from "mindgrub/graphviz";

// @ts-ignore: WIP
import { object_graph_to_dot } from "./general-object-to-graphviz";
import { system_log_to_dot } from "./system_graphviz_utils";
//const bearitones_that = x => {};
// set up a subscriber to the main subsystem for this context
// @ts-ignore: WIP
const reflection_sink = window[Symbol.for("reflection-sink")];
// @ts-ignore: WIP
let reflection_log = window["reflection_log"];

// @ts-ignore: WIP
if (reflection_sink && !window["reflect_subscribed"]) {
  // @ts-ignore: WIP
  window["reflect_subscribed"] = true;
  // @ts-ignore: WIP
  reflection_log = window["reflection_log"] = [];
  reflection_sink.listen(x => {
    reflection_log.push(x);
  });
}

let dot_graph;
if (reflection_log) {
  dot_graph = {
    type: "graph",
    directed: true,
    statements: [{ type: "node", id: "hello", attributes: { label: "world" } }],
  };

  dot_graph = system_log_to_dot(reflection_log);

  // dot_graph = object_graph_to_dot(reflection_log);

  dot_graph.attributes = dot_graph.attributes || {};
  //dot_graph.attributes.layout = "fdp";
  //yield "forcelabels=true";
  //yield "layout=dot";
  //yield `quadtree=false`;
}

export const reflect = () => ({
  reflection_size: reflection_log.length,
  log_dot: dot_graph && dot.serialize_dot(dot_graph),
  //reflection_log: log_dot && dot.serialize_dot(log_dot),
  // reflection_log: reflection_log.reverse(),
  //reflection_log,
  foo: reflection_sink,
  random: Math.random(),
});
