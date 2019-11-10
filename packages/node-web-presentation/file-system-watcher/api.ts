const NAMESPACE = "@def.codes/file-system";
// But I want the type of this to be a literal.
// export const CHANGE_MESSAGE_TYPE = `${NAMESPACE}/WatcherChangeMessage`;
export const CHANGE_MESSAGE_TYPE =
  "@def.codes/file-system/WatcherChangeMessage";
export const WATCHER_TYPE = "@def.codes/file-system/Watcher";

export interface FileSystemWatcherOptions {
  /** https://nodejs.org/api/fs.html#fs_fs_watch_filename_options_listener
   *
   * Indicates whether the process should continue to run as long as files are
   * being watched. Default: true.
   */
  persistent?: boolean;

  /* https://nodejs.org/api/fs.html#fs_fs_watch_filename_options_listener
   *
   * > Indicates whether all subdirectories should be watched, or only the
   * > current directory. This applies when a directory is specified, and only
   * > on * supported platforms (See Caveats). Default: false.
   */
  recursive?: boolean;
}

export interface FileSystemChangeMessage {
  readonly "@type": typeof CHANGE_MESSAGE_TYPE;

  // Dir of watcher.
  // - reader now has to re join
  // - watcher can be on a file
  // but
  // - filename might be null, so can't pre-join
  // Just going to assume for now that it's a directory
  readonly context: string;

  /** https://nodejs.org/api/fs.html#fs_fs_watch_filename_options_listener
   *
   * On most platforms, 'rename' is emitted whenever a filename appears or
   * disappears in the directory.
   */
  readonly type: "rename" | "change";

  /** https://nodejs.org/api/fs.html#fs_filename_argument
   *
   * `filename` is not always guaranteed to be provided. Therefore, don't assume
   * that `filename` argument is always provided in the callback, and have some
   * fallback logic if it is `null`.
   */
  readonly path: string | null;
}

// But prototype properties don't serialize even when enumerable.
/*
const message_prototype = Object.defineProperty({}, "@type", {
  value: CHANGE_MESSAGE_TYPE,
  enumerable: true,
});
*/
