// doen't clean up after itself
import { create_server, with_constant } from "@def.codes/simple-http-server";
import { Server } from "ws";

const html = (ws_port: number) => `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><title>polling viewer</title></head>
<body>
<script>
const container = document.createElement("div");
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
  const client = new WebSocket("ws://" + window.location.hostname + ":${ws_port}")
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
</script>
</body>
</html>
`;

export function make_image_socket_viewer(http_port = 1234, ws_port = 2345) {
  // Kind of a hack so that initial svg is sent to new browser.
  let last_message;

  // make socket server
  const wss = new Server({ port: ws_port, clientTracking: true });
  wss.on("connection", client => {
    if (last_message) client.send(last_message);
  });

  // make http server
  const server = create_server({
    port: http_port,
    handler: with_constant({
      response: {
        headers: { "Content-type": "text/html" },
        status: 200,
        content: html(ws_port),
      },
    }),
  });

  return {
    send(payload) {
      let message: string;
      try {
        message = JSON.stringify(payload);
      } catch (error) {
        console.error("Couldn't serialize or send message", message);
        return;
      }
      last_message = message;
      for (const client of wss.clients) client.send(message);
    },
  };
}
