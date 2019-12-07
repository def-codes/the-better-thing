import * as Dot from "@def.codes/graphviz-format";
// singleton browser connection / svg updater
import { shell_command } from "./node-utils/index";
import { dot_socket_updater } from "./launcher/dot-socket-viewer";

export const dot_to_svg = (dot: string) => shell_command("dot", ["-Tsvg"], dot);

export const make_display = () => {
  // create browser connection
  // reason for this setup is so that it's lazy init
  let _viewer: ReturnType<typeof dot_socket_updater>;

  const viewer = () => (_viewer || (_viewer = dot_socket_updater())).viewer;

  return Object.assign((thing: any) => viewer().send(thing), {
    graph: async (graph: Dot.Graph, trace?: boolean) => {
      const dot = Dot.serialize_dot(graph);
      // viewer.send({ dot });
      // if (trace) console.log(dot);
      const result = await dot_to_svg(dot);
      if (result) viewer().send({ svg: result.stdout.toString("utf8") });
    },
  });
};
