// parametric subprocess

files_to_watch = set();

// watchers is a thing that maps a set of filenames into a set a of file watchers
watchers = thing(files =>
  // using array for entailment means each child gets a number for name
  // files.map(file => watch({ path }));
  // better, make the names be the filenames
  dictionary_from(files, path => watch({ path }))
);
// that only works if watch is somehow a lazy expression

// ALSO, watchers needs to listen to files_to_watch
