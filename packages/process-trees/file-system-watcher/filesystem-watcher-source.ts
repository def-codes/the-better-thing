import {
  FileSystemWatcherOptions,
  FileSystemChangeMessage,
  CHANGE_MESSAGE_TYPE,
} from "./api";
import { watch } from "fs";
import { StreamSource } from "@thi.ng/rstream";

// This is not exactly like the other "from" methods in that it returns a stream
// *source* rather than a stream.  This is effectively the same except that it
// doesn't depend on rstream.
export const filesystem_watcher_source = (
  context: string,
  options?: FileSystemWatcherOptions
): StreamSource<FileSystemChangeMessage> => sub => {
  const watcher = watch(context, options);

  watcher.on("change", (type: "rename" | "change", path: string | null) => {
    sub.next({
      "@type": CHANGE_MESSAGE_TYPE,
      type,
      context,
      path,
    });
  });

  watcher.on("error", error => sub.error(error));
  watcher.on("close", () => sub.done()); // ?? maybe

  return () => watcher.close();
};
