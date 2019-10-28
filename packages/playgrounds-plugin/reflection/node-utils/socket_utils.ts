import * as WebSocket from "ws";
import * as util from "util";

/** Broadcast the given message as JSON to all registered socket clients. */
export function broadcast_as_json(socket: WebSocket.Server, data: any): void {
  let json: string;
  try {
    json = JSON.stringify(data);
  } catch {
    throw new Error("Error stringifying " + util.format(data));
  }
  for (let client of socket.clients)
    if (client.readyState === WebSocket.OPEN) client.send(json);
}
