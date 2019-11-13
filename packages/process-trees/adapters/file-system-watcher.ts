// REFLECT
//   FSWatcher is the type in node
//   however, it can't be fully reflected since the constructor info is lost
// REIFY:
//   see filesystem_watcher_source
//   given constructor info
//     context (path to watch)
//     and options
//   creates an ingress (stream source)
//     that cleans up when the stream is *canceled*
//   That is already a minimal interface
import { ISubsystemAdapter } from "./api";
// TEMP: this doesn't belong here, process-trees shouldn't have a node dependency
import { filesystem_watcher_source } from "../file-system-watcher/index";

export interface FileSystemWatcherBlueprint {
  path: string;
}

export const file_system_watcher_adapter: ISubsystemAdapter<FileSystemWatcherBlueprint> = {
  can_create_contingent_processes: false,
  reify(blueprint) {
    const stream = filesystem_watcher_source(blueprint.path);
    // Make a stream from this and processify it...
    return {};
  },
};
