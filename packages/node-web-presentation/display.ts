import * as Dot from "@def.codes/graphviz-format";
// singleton browser connection / svg updater
import { shell_command } from "./node-utils/index";
import { launch_connected_browser } from "./launcher/launch-connected-browser";

export const dot_to_svg = (dot: string) => shell_command("dot", ["-Tsvg"], dot);

const SVG_VIEWER_BOOT_SCRIPT = `const container = document.createElement("div");
document.body.appendChild(container);
let fit = true;
const set_fit = (svg) => {
  svg.style.maxHeight = fit ? "100vh" : "";
  svg.style.maxWidth = fit ? "100vw" : "";
}
function update(code) {
  container.innerHTML = code;
  // TIL https://www.w3.org/TR/selectors-3/#univnmsp
  const svg = container.querySelector('*|svg');
  if (svg) {
    svg.onclick = () => { fit = !fit; set_fit(svg) };
    // Remove explicit width and height from SVG
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    svg.style.cssText = "display: block;";
    set_fit(svg);
  }
}
function init() {
  const params = new URLSearchParams(window.location.search);
  const ws_port = params.get('ws_port');
  if (!ws_port) {
    console.warn("No socket port indicated!  How do I contact the system?");
    return
  }
  const client = new WebSocket("ws://" + window.location.hostname + ":" + ws_port)
  client.onopen = event => console.log("socket connected")
  client.onmessage = event => {
    let message;
    try {
      message = JSON.parse(event.data);
    } catch (error) {
      console.error("Error parsing message JSON", event.data);
      return;
    }
    if (message.svg) update(message.svg)
  };
}
init();
`;

export const make_display = () => {
  // create browser connection
  // reason for this setup is so that it's lazy init
  let _viewer: ReturnType<typeof launch_connected_browser>;

  const viewer = () =>
    (_viewer || (_viewer = launch_connected_browser(SVG_VIEWER_BOOT_SCRIPT)))
      .viewer;

  return Object.assign((thing: any) => viewer().send(thing), {
    graph: async (graph: Dot.Graph, trace?: boolean) => {
      const dot = Dot.serialize_dot(graph);
      // viewer.send({ dot });
      // if (trace)
      // console.log(dot);
      const result = await dot_to_svg(dot);
      if (result) viewer().send({ svg: result.stdout.toString("utf8") });
    },
  });
};
