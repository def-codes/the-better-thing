// singleton browser connection / svg updater
import { dot_socket_updater } from "./launcher/dot-socket-viewer";

export const display = (() => {
  // create browser connection
  // reason for this setup is so that it's lazy init
  let grapher: ReturnType<typeof dot_socket_updater>;

  return (thing: any) => {
    if (!grapher) grapher = dot_socket_updater();
    // how to coerce to graph without putting a bunch of interpretation here?
    grapher.go(thing);
  };
})();
