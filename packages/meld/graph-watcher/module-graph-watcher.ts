// mechanism for watching a module graph from a given root
// Uses (and mutates!) global require cache
import { join, dirname } from "path";
import * as rs from "@thi.ng/rstream";
import * as tx from "@thi.ng/transducers";
import { filesystem_watcher_source } from "@def.codes/process-trees";
import {
  invalidate,
  transitive_dependents,
} from "@def.codes/node-live-require";
import { debounce } from "./debounce";

interface ModuleGraphWatcher {
  main_invalidated: rs.ISubscribable<unknown>;
  any_invalidated: rs.ISubscribable<string>;
}

interface ModuleGraphWatcherOptions {
  delay: number;
}

// Watch a module graph using a given module as entrypoint.
// Transitively invalidates cache when modules change.
//
// ASSUMES all changes of interest will be in the same directory tree as the
// initial module.
export const module_graph_watcher = (
  filename: string,
  options?: Partial<ModuleGraphWatcherOptions>
): ModuleGraphWatcher => {
  const delay = options?.delay ?? 100;

  const dir = dirname(filename);

  const watcher = rs.stream(
    filesystem_watcher_source(dir, { recursive: true })
  );

  // TS: last item in these generic chains are not inferring last item correctly
  const file_changes = watcher.transform(
    tx.comp(
      tx.filter(_ => {
        const good = typeof _.path === "string";
        if (!good) console.warn("Unexpected value for path:", _.path);
        return good;
      }),
      tx.map(_ => join(_.context, _.path)),
      // If an invalidated module fails to load on the next attempt, it's no
      // longer in the graph and so this would prevent changes from triggering
      // an update.  We happen to know about the main module *a priori* so we
      // include it.  But isn't this still broken for other modules?
      // tx.filter(file => file === filename || file in require.cache),
      tx.throttle<string>(debounce(delay))
    )
  );

  // TS: this one works with comp but not with transform overloads
  const any_invalidated = file_changes.transform(
    tx.comp(
      tx.map(filename => transitive_dependents(filename, require.cache)),
      tx.flatten(),
      tx.sideEffect(filename => {
        invalidate(filename);
      })
    )
  );

  const main_invalidated = any_invalidated.transform(
    tx.filter(invalidated => invalidated === filename)
  );

  return { main_invalidated, any_invalidated };
};
