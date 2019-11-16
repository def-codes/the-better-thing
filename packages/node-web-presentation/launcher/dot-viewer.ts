import * as Dot from "@def.codes/graphviz-format";
import { pathToFileURL } from "url";
import { make_image_polling_viewer } from "./viewer";
import { shell_open, shell_command } from "../node-utils/index";

export const dot_to_svg_file = (dot: string, file: string) =>
  shell_command("dot", ["-Tsvg", "-o", file], dot);

export function dot_updater(image_name = "dot.svg") {
  const { html_file, image_file } = make_image_polling_viewer(image_name);
  // See note in fn, hash and query are dropped on Windows.  not sure if that's fixable
  shell_open(pathToFileURL(html_file) + "#" + encodeURIComponent(image_name));

  return {
    go: (graph: Dot.Graph) => {
      const dot = Dot.serialize_dot(graph);
      console.log(`dot`, dot);

      return dot_to_svg_file(dot, image_file);
    },
  };
}
