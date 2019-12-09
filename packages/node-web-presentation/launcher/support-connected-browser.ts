// doen't clean up after itself
import {
  create_server,
  with_constant,
  with_path_mount,
} from "@def.codes/simple-http-server";
import { Server } from "ws";

const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><title>MELD system</title></head>
<body>
<script src="/meld.js"></script>
</body>
</html>
`;

export function support_connected_browser(
  bootstrap_script: string,
  http_port = 1234,
  ws_port = 2345
) {
  // Kind of a hack so that initial svg is sent to new browser.
  let last_message;

  // make socket server
  const wss = new Server({ port: ws_port, clientTracking: true });
  wss.on("connection", client => {
    if (last_message) client.send(last_message);
  });

  // SIDE EFFECT: make http server.  This should be tracked as part of process
  create_server({
    port: http_port,
    handler: with_path_mount({
      mappings: [
        {
          path: "meld.js",
          handler: with_constant({
            response: {
              headers: { "Content-type": "application/javascript" },
              status: 200,
              content: bootstrap_script,
            },
          }),
        },
        {
          path: "",
          handler: with_constant({
            response: {
              headers: { "Content-type": "text/html" },
              status: 200,
              content: html,
            },
          }),
        },
      ],
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
