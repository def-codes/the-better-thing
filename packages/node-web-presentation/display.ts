import * as Dot from "@def.codes/graphviz-format";
import * as tx from "@thi.ng/transducers";
// singleton browser connection / svg updater
import { shell_command } from "./node-utils/index";
import { launch_connected_browser } from "./launcher/launch-connected-browser";

export const dot_to_svg = (dot: string) => shell_command("dot", ["-Tsvg"], dot);

const style =
  `.stack {
  position: relative;
  transform-style: preserve-3d;
  perspective: 10em;
}
.stack > * {
  position: absolute;
  background: rgba(255, 255, 255, 0.5);
}` +
  Array.from(
    tx.range(2, 100),
    n => `
.stack > :nth-child(${n}) {
    transform: translate3d(0, 0, -${n}em);
}`
  ).join("");

const SVG_VIEWER_BOOT_SCRIPT = `
const style = document.createElement("style");
style.innerHTML = \`${style}\`;
document.body.appendChild(style);
const stack = document.createElement("div");
stack.setAttribute("class", "stack");
document.body.appendChild(stack);
const make_container = () => {
  const container = document.createElement("div");
  // return stack.appendChild(container);
  return stack.insertBefore(container, stack.firstChild);
};
let socket;
const XLINK_NS = "http://www.w3.org/1999/xlink";
const NAV_TYPE = "https://def.codes/vocab/Nav";
let fit = true;
const set_fit = (svg) => {
  svg.style.maxHeight = fit ? "100vh" : "";
  svg.style.maxWidth = fit ? "100vw" : "";
  // svg.style.width = fit ? "400vw" : "";
}
function update(code, container) {
  container.innerHTML = code;
  // TIL https://www.w3.org/TR/selectors-3/#univnmsp
  const svg = container.querySelector('*|svg');
  if (svg) {
    svg.onclick = (event) => { 
      const link = event.target.closest('a');
      if (link) {
        const link_href = link.getAttribute("href");
        const xlink_href = link.getAttributeNS(XLINK_NS, "href");
        const href = link_href || xlink_href;
        const context = "TBD";
        if (href) {
          if (socket)
            socket.send(JSON.stringify({ "@type": NAV_TYPE, context, href }));
          else
            console.log("Can't send navigation event because no socket")
          event.stopPropagation();
          event.preventDefault();
        }
        else console.log("click on link without href", { link_href, xlink_href });
      } else {
        const node = event.target.closest('g.node')
        // Okay, we can detect nodes, but let's stick with hrefs if we can
        if (node) console.log("clicked node", node.id)
        else {
          console.log("clicked non-node", event.target)
          fit = !fit;
          set_fit(svg);
          if (event.target === event.currentTarget) console.log("clicked svg");
        }
      }
    };
    // Remove explicit width and height from SVG
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    svg.style.cssText = "display: block;";
    set_fit(svg);
  }
}
let container = make_container();
function init() {
  const params = new URLSearchParams(window.location.search);
  const ws_port = params.get('ws_port');
  if (!ws_port) {
    console.warn("No socket port indicated!  How do I contact the system?");
    return
  }
  const client = new WebSocket("ws://" + window.location.hostname + ":" + ws_port)
  socket = client;
  client.onopen = event => console.log("socket connected")
  client.onmessage = event => {
    let message;
    try {
      message = JSON.parse(event.data);
    } catch (error) {
      console.error("Error parsing message JSON", event.data);
      return;
    }
    if (message.clear_svg) stack.innerHTML = '';
    if (message.svg) update(message.svg, container);
    if (message.push_svg) update(message.push_svg, make_container());
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
    nav: () => viewer().nav,
    clear: () => viewer().send({ clear_svg: {} }),
    graphviz: async (graph: Dot.Graph, trace?: boolean) => {
      const dot = Dot.serialize_dot(graph);
      const result = await dot_to_svg(dot);
      // if (result) viewer().send({ svg: result.stdout.toString("utf8") });
      if (result) viewer().send({ push_svg: result.stdout.toString("utf8") });
    },
  });
};
