/** A TypeScript plugin to serve real-time module code during editing. */

// TODO: does plugin have a detroy hook?  e.g. to close server and other
// resources?  (or notify "reflection" to do so?)

import * as ts_module from "typescript/lib/tsserverlibrary";
import * as util from "util";
import * as path from "path";
import { Channel } from "@def.codes/meld-process";
import { map_object } from "@def.codes/helpers";
import {
  start_reflection_server,
  ReflectionServerOptions,
} from "./reflection/reflection_server";
import { make_text_sink } from "./reflection/system_console_utils";

/** Return a copy of an object instance with all of its methods bound.  Assumes
 * all of its members are functions.*/
const bound_copy_of = <T extends { [K in keyof T]: Function }>(o: T): T =>
  map_object(v => (<Function>v).bind(o), o);

function init(modules: { typescript: typeof ts_module }) {
  const ts = modules.typescript;
  const versions = Object.create(null);

  function create(info: ts.server.PluginCreateInfo) {
    const log = s => info.project.projectService.logger.info("MELD: " + s);

    log("init plugin, config: " + util.format(info.config));
    const config: Pick<
      ReflectionServerOptions,
      "site_port" | "socket_port" | "name"
    > = info.config;
    const project_root = info.serverHost.getCurrentDirectory();
    const resolved_plugin_module = require.resolve(
      "@def.codes/playgrounds-plugin"
    );
    const resolved_plugin_module_dir = path.dirname(resolved_plugin_module);
    // If this happened to be resolved there...
    const plugin_root = resolved_plugin_module_dir; // `${project_root}/node_modules/@def.codes/playgrounds-plugin`;

    // But suppose you want to set an alternate location for the site?
    // You need a way to ensure that the node_modules that you depend on
    // (e.g. other @def.codes packages)

    const proxy = bound_copy_of(info.languageService);
    log("created proxy");

    const reflection_sink = make_text_sink({
      format: o => util.inspect(o, { depth: 10, breakLength: 80 }),
      sink_ouput: message => log("REFLECTION: " + message),
    });

    const get_emit = (fileName: string) => {
      const program = info.project.getLanguageService().getProgram();

      if (!program) throw new Error("Language service provided no program.");

      // `info.languageServiceHost.resolveModuleNames` would probably be more
      // appropriate here, but this would have to be made async.
      const name = fileName.replace(/\.[jt]sx?$/i, "");
      const resolved = ["ts", "js", "tsx", "jsx"]
        .map(ext => `${name}.${ext}`)
        .find(file => info.project.fileExists(file));

      if (!resolved) throw new Error("None of those files exist!");
      const sourceFile = program.getSourceFile(resolved);

      // Source file has changed, check for errors
      const raw_diagnostics = [
        ...program.getSyntacticDiagnostics(sourceFile),
        ...program.getSemanticDiagnostics(sourceFile),
      ];
      const errors = raw_diagnostics.filter(
        _ => _.category === ts_module.DiagnosticCategory.Error
      );
      // More compact version for display
      const diagnostics = raw_diagnostics.map(
        ({ category, code, messageText }) => ({ category, code, messageText })
      );

      // The client module uses the `path` to this source file as a module id.
      return errors.length > 0
        ? { diagnostics }
        : {
            emit: info.project.getLanguageService().getEmitOutput(resolved),
            // Casing in directory names is inconsistent between
            // `serverHost.getCurrentDirectory` and fileName (on OSX).
            path: path.relative(
              project_root.toLowerCase(),
              fileName.toLowerCase()
            ),
            diagnostics,
          };
    };

    const emit_if_changed = (fileName: string) => {
      // Has source file changed?
      const lastVersion = versions[fileName];
      const version = info.project.getScriptVersion(fileName);
      if (version !== lastVersion) {
        versions[fileName] = version;
        sink(get_emit(fileName));
      }
    };

    const message_channel = new Channel(1);
    // THIS returns a system, but right now there's no cleanup hook, see note
    // above.
    start_reflection_server({
      ...config,
      ingress_channel: message_channel,
      sink: reflection_sink,
      typescript: ts,
      compiler_options: info.project.getCompilerOptions(),
      get_emit,
      info,
      plugin_root,
      project_root,
    });
    log("started reflection system");

    info.project.setCompilerOptions({
      ...info.project.getCompilerOptions(),
      // The remaining settings will override the project's settings.

      // Optimizations.  It appears that these don't impact the watcher output.
      removeComments: true,
      module: ts.ModuleKind.AMD, // header is smaller and simpler than UMD
      inlineSourceMap: false,

      // Both of these are category 1, which is error.  Not sure that either
      // should prevent emit.

      // 2345
      // Argument of type '() => IterableIterator<any>' is not assignable to parameter of type 'Iterable<any>'.

      // 2324
      // Property '[Symbol.iterator]' is missing in type '() => IterableIterator<any>'.

      // Even if the “actual” module emit is targeting ES5, development mode
      // generally assumes a modern browser.  Don't bother downleveling.
      target: ts_module.ScriptTarget.ES2015,

      // Ignore errors that don't prevent meaningful output.
      noUnusedLocals: false,
      noUnusedParameters: false,
    });

    const sink = message => {
      log(util.format(message));
      message_channel.put(message);
    };

    proxy.getDocumentHighlights = (fileName, position, files) => {
      emit_if_changed(fileName);
      return info.languageService.getDocumentHighlights(
        fileName,
        position,
        files
      );
    };

    return proxy;
  }

  return { create };
}

export default init;
