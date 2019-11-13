# File system watcher MELD adapters.

Adapters for Node's notoriously bad file system watcher.

## Vocabulary

The namespace root for this vocabulary is `@def.codes/meld/fs`

Or something like that.

### `watches` property

Indicates that the subject watches the object, which is expected to be a string
representing a file system path.

`watches` is a functional property.  One resource will not watch more than one
location.  If you want multiple locations, use a stream merge.


### `watchesRecursive` property

Same as `watches` except that it includes subdirectories.
