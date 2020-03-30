/** Tools for seeing the module dependency graph of a TypeScript project.
 *
 * Assumes it is run from node with the current directory being root of a
 * typescript project.
 */
import * as ts_module from "typescript/lib/tsserverlibrary";

//export type DependencyGraph = Map<string, string[]>;
export type DependencyGraph = { [key: string]: string[] };

/** Return a function that returns a graph of the modules of the current
 * Typescript project.  Where “current” means the one relative to the directory
 * where the process is currently running. */
export const dependency_grapher = () => {
  // What are these for?  The tsconfig appears to be picked up anyway.
  const compiler_options = {};
  const host = ts_module.createCompilerHost(compiler_options);
  let graph: DependencyGraph = Object.create(null); // new Map();

  const hook = (importer, resolved) => {
    //graph.set(importer, resolved.filter(_ => !!_).map(_ => _.resolvedFileName));
    graph[importer] = resolved.filter(_ => !!_).map(_ => _.resolvedFileName);
  };

  host.resolveModuleNames = function (imports, importer) {
    const resolved = imports.map(
      name =>
        ts_module.resolveModuleName(name, importer, {}, this).resolvedModule
    );

    hook(importer, resolved);

    return resolved;
  };

  return (entry_point: string): DependencyGraph => {
    // Reset from previous iteration.
    graph = Object.create(null); // new Map();
    const project_dir = ts_module.sys.getCurrentDirectory();
    // ASSUMES `entry_point` includes directory relative to tsconfig (e.g. src)
    entry_point = `${project_dir}/${entry_point}`;
    // Calls module resolver as a side-effect
    ts_module.createProgram([entry_point], {}, host);
    const normalize = (path: string) =>
      path.substring(0, project_dir.length) === project_dir
        ? path.substring(project_dir.length)
        : path;
    const normalized_graph = Object.create(null); // new Map();
    //for (let [key, value] of Object.entries(graph))
    //normalized_graph.set(normalize(key), value.map(normalize));
    for (let key of Object.keys(graph))
      normalized_graph[normalize(key)] = graph[key].map(normalize);
    return normalized_graph;
  };
};
