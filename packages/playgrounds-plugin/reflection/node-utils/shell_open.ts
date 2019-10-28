/** Ask the operating system to open a file with the default application. */

// Basically a less-capable version of
// https://github.com/pwnall/node-open/blob/master/lib/open.js

import * as child_process from "child_process";

// This has to be done through a shell because not all OS's provide this
// function as a direct executable.

export function shell_open(file: string) {
  const command = "open"; // darwin
  return child_process.exec(`${command} "${file}"`);
}
