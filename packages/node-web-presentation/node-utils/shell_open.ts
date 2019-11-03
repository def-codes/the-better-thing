/** Ask the operating system to open a file with the default application. */

// Basically a less-capable version of
// https://github.com/pwnall/node-open/blob/master/lib/open.js

// Yes, there's this https://www.npmjs.com/package/open
// and yes, I should use it.

import * as child_process from "child_process";

// This has to be done through a shell because not all OS's provide this
// function as a direct executable.

export function shell_open(file: string) {
  return process.platform === "win32"
    ? child_process.spawn("cmd.exe", ["/C", "start", file])
    : child_process.spawn(process.platform === "darwin" ? "open" : "xdg-open", [
        file,
      ]);
}
