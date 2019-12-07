import { make_image_socket_viewer } from "./socket-viewer";
import { shell_open } from "../node-utils/index";

export function dot_socket_updater(http_port = 1234, ws_port = 2345) {
  const viewer = make_image_socket_viewer(http_port, ws_port);
  // only 1 constant handler so all paths should get same
  shell_open(`http://localhost:${http_port}/index.html`);
  return { viewer };
}
