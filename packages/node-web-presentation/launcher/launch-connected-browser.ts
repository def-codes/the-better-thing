import { support_connected_browser } from "./support-connected-browser";
import { shell_open } from "../node-utils/index";

export function launch_connected_browser(
  bootstrap_script: string,
  http_port = 1234,
  ws_port = 2345
) {
  const viewer = support_connected_browser(
    bootstrap_script,
    http_port,
    ws_port
  );
  shell_open(`http://localhost:${http_port}?ws_port=${ws_port}`);
  return { viewer };
}
