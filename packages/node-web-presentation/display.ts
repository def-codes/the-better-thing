// singleton browser connection / svg updater
import { dot_updater } from "./launcher/dot-viewer";

export const display = (() => {
  // create browser connection
  // reason for this setup is so that it's lazy init
  let grapher: ReturnType<typeof dot_updater>;

  return (thing: any) => {
    if (!grapher) grapher = dot_updater();
    // how to coerce to graph without putting a bunch of interpretation here?
    grapher.go(thing);
  };
})();
