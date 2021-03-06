// INVARIANT 1. it MUST close the watcher when the process dies
// INVARIANT 2. it MUST die when the watcher closes

// ENTAILS:
// - an ingress (stream source)
import { ISubsystemAdapter } from "./api";
// TEMP: this doesn't belong here, process-trees shouldn't have a node dependency
import {
  filesystem_watcher_source,
  WATCHER_TYPE,
  FileSystemWatcherOptions,
} from "../file-system-watcher/index";

export interface FileSystemWatcherBlueprint {
  path: string;
  options?: FileSystemWatcherOptions;
}

// REFLECT
//
// FSWatcher can't be fully reflected because the instance does not provide the
// information used to construct it---particularly, the base path.  Since change
// messages include only the relative path, a reflected watcher cannot be used
// in the same way as a reified one.
//
// The same is true of the extended options.
//
interface FileSystemWatcherDescription extends FileSystemWatcherBlueprint {
  "@type": typeof WATCHER_TYPE;
}
/////

// STATE MACHINE
// Should it even be necessary to say this, then?
import { ESSENTIAL_PROCESS_MACHINE_SPEC } from "./process";
export const file_system_watcher_state_machine = ESSENTIAL_PROCESS_MACHINE_SPEC;
/////

// STDIN:
// none.  This is an INGRESS

// STDOUT:
// change messages

// MESSAGES:
// only change messages (stdout)

// REIFY
import { reify_protocol } from "../reify/index";
reify_protocol.extend(
  WATCHER_TYPE,
  ({ path, options }: FileSystemWatcherBlueprint, system) => {
    // NEED wrapper/helper to make process based on stream source
    const stream = filesystem_watcher_source(path, options);
    return {
      dispose() {},
    };
  }
);
/////

export const file_system_watcher_adapter: ISubsystemAdapter<FileSystemWatcherBlueprint> = {
  type_iri: WATCHER_TYPE,
  can_create_contingent_processes: false,
};
