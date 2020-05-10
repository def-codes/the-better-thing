const {
  create_server,
  with_static_files,
} = require("@def.codes/simple-http-server");
const { shell_open } = require("@def.codes/node-web-presentation");
const fs = require("fs");

const PORT = 1234;

// HACK: @thi.ng packages provide source maps but don't point to them.
const orig_readFileSync = fs.readFileSync;
const THING_LIB = /\/node_modules\/@thi.ng\/([^\/]+)\/lib\/index\.umd\.js$/;
fs.readFileSync = function (file) {
  const thing_lib = file.match(THING_LIB);
  if (thing_lib) {
    const [, lib] = thing_lib;
    return (
      orig_readFileSync(file) +
      "\n//# sourceMappingURL=/node_modules/@thi.ng/" +
      lib +
      "/lib/index.umd.js.map"
    );
  }
  return orig_readFileSync(file);
};

create_server({ port: PORT, handler: with_static_files(), fs });

// Open a browser
shell_open(`http://localhost:${PORT}`);
