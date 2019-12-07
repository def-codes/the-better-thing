import * as Dot from "@def.codes/graphviz-format";
import { make_image_socket_viewer } from "./socket-viewer";
import { shell_open, shell_command } from "../node-utils/index";

export const dot_to_svg = (dot: string) => shell_command("dot", ["-Tsvg"], dot);

export function dot_socket_updater(http_port = 1234, ws_port = 2345) {
  const viewer = make_image_socket_viewer(http_port, ws_port);
  // only 1 constant handler so all paths should get same
  shell_open(`http://localhost:${http_port}/index.html`);
  return {
    go: async (graph: Dot.Graph, trace?: boolean) => {
      const dot = Dot.serialize_dot(graph);
      viewer.send({ dot });
      if (trace) console.log(dot);
      const result = await dot_to_svg(dot);
      if (result) {
        const svg = result.stdout.toString("utf8");
        viewer.send({ svg });
      }
    },
  };
}
