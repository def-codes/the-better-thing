/** The node part of the reflection system. */
// But... is there any other part?

import * as WebSocket from "ws";
import * as _path from "path";

import { serialize_query, Handler } from "@def.codes/simple-http-server";
import { identity, delayed } from "@thi.ng/compose";

import {
  System,
  Channel,
  GeneratorProcess,
  SystemSink,
  // For plumbing
  mapping_process,
} from "@def.codes/meld-process";
import { make_text_sink } from "./system_console_utils";
import * as reflection from "../reflection-constants";

// For Typescript reflection
import * as ts_module from "typescript/lib/tsserverlibrary";
import { CompilerOptions, EmitOutput } from "typescript/lib/tsserverlibrary";

import {
  create_server, // For the web site
  // For the web server
  with_constant,
  with_path_mount,
  with_static_files,
  with_node_modules,
} from "@def.codes/simple-http-server";
import {
  broadcast_as_json, // For the socket server
} from "./node-utils/socket_utils";
// For launching the browser
import { shell_open } from "./node-utils/shell_open";
// For module graph discovery
// import { fork_process } from "mindgrub-node";
import { plugin_dispatch_service } from "./plugin_dispatch_service";
import { graphviz_service } from "./graphviz_service";

// For visualizing module dependencies
//import { modules_to_digraph } from "../graphviz/module_graphviz_utils";

export interface ReflectionServerOptions extends ts_module.PluginImport {
  site_port?: number;
  socket_port?: number;
  ingress_channel?: Channel;
  sink?: SystemSink;
  typescript: typeof ts_module;
  compiler_options: CompilerOptions;
  info: ts.server.PluginCreateInfo;
  get_emit: (
    file: string
  ) => { diagnostics?: any; emit?: EmitOutput; path?: string } | undefined;
  plugin_root: string;
  project_root: string;
  node_modules_root: string;
}

const emit_handler = (
  project_root: string,
  get_emit: ReflectionServerOptions["get_emit"]
): Handler => request => {
  // The request may include any extension, but it will be ignored.
  const source_path = _path.join(project_root, request.path);
  const result = get_emit(source_path);
  return result && result.emit
    ? {
        status: 200,
        message: "OK",
        content: result.emit.outputFiles[0].text,
      }
    : {
        // This is not really an internal server error, the source doc
        // is just in a bad state.
        status: 500,
        message: "Internal Server Error",
        content: JSON.stringify(result && result.diagnostics),
      };
};

// Run a static file server rooted in the (mindgrub) plugin's package directory,
// and also map the current (consuming) project's root to a special path.
function* create_site_server(
  port: number,
  plugin_root: string,
  project_root: string,
  modules_root: string,
  plugin_info: ts.server.PluginCreateInfo,
  get_emit: ReflectionServerOptions["get_emit"]
) {
  const handler = with_path_mount({
    mappings: [
      // At `emit`, serve module source directly from the languages server.
      // if this is base url for require, then how can it also work for absolute module id's?
      { path: "modules/emit", handler: emit_handler(project_root, get_emit) },
      // Provide a way to execute code against the plugin
      { path: "plugin", handler: plugin_dispatch_service(plugin_info) },
      // The consuming project's files are mounted at `project`.
      // but... this isn't necessarily where the node_modules are located
      // since this can be a subproject
      // and it can of course have its own node modules
      // you could do require.resolve("requirejs"), but that's for the node module
      // ultimately, we're going to use our own (def.codes) require
      { path: "project", handler: with_static_files({ root: project_root }) },
      { path: "modules", handler: with_node_modules({ root: modules_root }) },
      // Convert Graphviz Dot code to graphic formats.
      { path: "graphviz", handler: graphviz_service() },
      // Putting this here for now, in case site root is different...
      {
        path: "plugin_files",
        handler: with_static_files({ root: plugin_root }),
      },
      // Hmm, okay when this is the exact thing, but it doesn't work like a disk
      // file (i.e. isn't used as fallback for directory with no file).  So
      // maybe use as fallback?
      {
        path: "",
        handler: with_constant({
          response: {
            headers: { "Content-type": "text/html" },
            content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Typescript playgrounds</title>
  </head>
  <body>
    <h1>play</h1>
    <div id="mindgrub-reflect"></div>
    <pre id="test"></pre>
    <script>
      var require = {
        // A “virtual” path which serves the current emit for source modules in
        // the project consuming the plugin.
        baseUrl: "/modules",
        paths: {
          "tslib": "tslib/tslib"
        }
      };
    </script>
    <script src="/modules/requirejs/require.js"></script>
    <script>
console.log("loading bootstrap");
      require(['@def.codes/browser-bootstrap'], bootstrap => {
console.log("loaded bootstrap, shimming require", bootstrap);
        bootstrap.shim_amd_require();
console.log("shimmed require, loading plugin client");
        window.require(['@def.codes/playgrounds-plugin-client'], playgrounds => {
console.log("loaded plugin client, initializing discovery", playgrounds);
          playgrounds.discovery_init()
console.log("initialized discovery");
        });
      });
    </script>
  </body>
</html>`,
          },
        }),
      },
      // The user should be able to set what is mounted at the site...
      // Yet you need to access an index that has the needed bootstrap
      // { path: "", handler: with_static_files({ root: plugin_root }) },
    ],
  });
  // TODO: register and dispose resource
  create_server({ port, handler });
}

const create_websocket_server: GeneratorProcess = function*(
  port: number,
  input: Channel,
  output: Channel
) {
  // TODO: register and dispose resource
  const websocket_server = new WebSocket.Server({ port });
  websocket_server.on("connection", (socket, _request) => {
    socket.on("message", message => {
      this.put(output, message);
    });
  });
  for (;;) {
    const message = yield this.take(input);
    broadcast_as_json(websocket_server, message);
  }
};

const reflection_server_main: GeneratorProcess = function*(
  options: ReflectionServerOptions
) {
  /* Get in front of the user */

  // Start a socket server
  const websocket_outgoing_channel = new Channel(2);
  const websocket_incoming_channel = new Channel(2);
  const socket_port = options.socket_port || reflection.DEFAULT_SOCKET_PORT;
  this.spawn(create_websocket_server, [
    { port: socket_port },
    websocket_outgoing_channel,
    websocket_incoming_channel,
  ]);

  // Start a web site
  // TODO: make persistent, i.e. re-open if it closes because of error
  const site_port = options.site_port || reflection.DEFAULT_SITE_PORT;
  this.spawn(create_site_server, [
    site_port,
    options.plugin_root,
    options.project_root,
    options.node_modules_root,
    options.info,
    options.get_emit,
  ]);

  // Open up a browser (via the shell) to the site that you're serving.  That
  // site should be configured to contact the mothership
  const params = { [reflection.SOCKET_PORT_KEY]: socket_port };
  const query = serialize_query(params);
  const reflection_site_address = `http://localhost:${site_port}?${query}`;
  const DTS = /\.d\.ts$/;
  const not_dts = s => !DTS.test(s);
  const no_src = s => s.replace(/(^\/src\/|\.ts$)/g, "");
  const get_graph = ({ graph }) => {
    const pruned = Object.create(null);
    for (let key of Object.keys(graph).filter(not_dts)) {
      const mod_val = graph[key].filter(not_dts).map(no_src);
      if (mod_val.length > 0) pruned[no_src(key)] = mod_val;
    }
    return pruned;
  };

  shell_open(reflection_site_address);

  // Wait for a connection to that server from the client
  // if you don't get a connection after a while, then try again

  // When you get a connection forward messages from the ingress channel
  const { ingress_channel } = options;
  if (ingress_channel)
    this.spawn(mapping_process, [
      identity,
      ingress_channel,
      websocket_outgoing_channel,
    ]);

  // This creates an initial module graph and so triggers the rest of the
  // pipeline.
  //
  // When running from the plugin in the mindgrub project,
  // __dirname = /Users/gcannizzaro/mindgrub/mindgrub/dist/umd/reflection (i.e., this script)
  // process.cwd() = /Users/GCannizzaro/mindgrub/mindgrub'

  // TODO: this runs in a different directory context when plugin is used by
  // other modules.
  /*
  this.spawn(fork_process, [
    __dirname + "/../node/module_graph_cli.js",
    ["src/index"],
    entry_point_channel,
    maybe_graph_channel,
    message => options.sink && options.sink(99, message),
  ]);
  */
  const entry_point_channel = new Channel(1);

  for (;;) {
    this.put(entry_point_channel, "src/index");
    yield delayed(true, 2000); // value is meaningless
  }
};

export function start_reflection_server(options: ReflectionServerOptions) {
  const sink = options.sink || make_text_sink();
  return new System(reflection_server_main, [options], sink);
}
