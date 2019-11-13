// REFLECT
//   FSWatcher is the type in node
//   however, it can't be fully reflected since the constructor info is lost
// ENTAILS:
// - an ingress (stream source)
//   - that cleans up when the stream is *canceled*
//   That is already a minimal interface
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

export const file_system_watcher_adapter: ISubsystemAdapter<FileSystemWatcherBlueprint> = {
  type_iri: WATCHER_TYPE,
  can_create_contingent_processes: false,
  reify(blueprint) {
    const stream = filesystem_watcher_source(blueprint.path, blueprint.options);
    // Make a stream from this and processify it...
    return {};
  },
};
