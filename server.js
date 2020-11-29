const {
  create_server,
  with_static_files,
  with_path_mount,
} = require("@def.codes/simple-http-server");
const { make_kb_context } = require("./kb/make-kb-context");
const {
  sparql_protocol,
  graph_store_protocol,
} = require("@def.codes/sparql-engine-service");
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

async function get_env(file = "./env.json") {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (error, result) => {
      if (error) reject(error);
      else resolve(JSON.parse(result));
    });
  });
}

async function main_impl() {
  let env;
  try {
    env = await get_env();
  } catch (error) {
    throw new Error("Failed to read environment configuration");
  }

  const mappings = [];

  if (env && env.sparql_index) {
    let kb_context;
    try {
      kb_context = make_kb_context({ db_index: env.sparql_index });
    } catch (error) {
      throw new Error(`Could not create KB service: ${error.message}`);
    }
    mappings.push({
      path: "kb/graph",
      handler: graph_store_protocol(kb_context),
    });
    mappings.push({
      path: "kb",
      handler: sparql_protocol(kb_context),
    });
  } else {
    console.log(`No SPARQL index location configured.  Proceeding without KB.`);
  }

  create_server({
    port: PORT,
    handler: with_path_mount({
      mappings: [...mappings, { path: "", handler: with_static_files() }],
    }),
    fs,
  });

  // Open a browser
  shell_open(`http://localhost:${PORT}`);
}

async function main() {
  try {
    await main_impl();
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
}

main();
