const {
  create_server,
  with_static_files,
} = require("@def.codes/simple-http-server");
const { shell_open } = require("@def.codes/node-web-presentation");

const PORT = 1234;

create_server({ port: PORT, handler: with_static_files() });

// Open a browser
shell_open(`http://localhost:${PORT}`);
