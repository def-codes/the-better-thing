import { with_path_mount, STATUS, shell_command } from "mindgrub-node";

const dot_to_svg = dot =>
  shell_command("dot", ["-Tsvg"], dot).then(_ => _.stdout.toString("utf-8"));

/** Create a handler to return Graphviz output for the given dot code. */
/** Currently assumes SVG format but could base this on query params.  If query
 * params were taken, they should match those used by `dot` itself.*/
export const graphviz_service = () =>
  with_path_mount({
    mappings: [
      {
        path: "dot",
        handler: async request => {
          const dot = request.body || request.query["code"];
          if (!dot) return STATUS.BAD_REQUEST;
          const svg = await dot_to_svg(dot);
          try {
            return {
              ...STATUS.OK,
              headers: { "Content-type": "image/svg+xml" },
              content: svg,
            };
          } catch (error) {
            return { ...STATUS.BAD_REQUEST, content: error.toString() };
          }
        },
      },
    ],
  });
