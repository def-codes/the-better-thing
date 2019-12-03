# Node live require

This package extends Node's module system to provide a live dependency graph.

Towards a virtual module system (stream-oriented, and separated from physical).

## Motivation

Interaction systems are more powerful than functional systems.  By creating a
feedback loop with a human actor, long-running programs can yield complex and
interesting results.  The client-server model facilitates this process by
allowing people to communicate with the running program through various
interfaces, presumably in ways that alter its internal state.

There is another side to this story.  The principle of dynamism applies to the
program itself, as well as its intended consumers.  The degree of interaction is
limited if the program is static.

A live programming environment, which was the norm for Lisp-based systems, has
not as a rule been adopted in other platforms.  This is even true in dynamic
languages such as JavaScript and Python, which could well support such usage.
This has been alleviated somewhat in the Python world by the rise in popularity
of the Jupyter notebook-based programming environments.

(Note in Lisp the interface to the live environment is often called a REPL.
This is not a REPL.)

While Node is able to host long-running processes, the code itself is treated as
static.  This is evidenced in the fact that `require`'s default behavior is to
cache modules so that their code is only referenced once.

## Prior art

Haven't looked.

## Design

TBD.  I simply note that this is similar to the dom-process interface.

Rather than looking at a module as a static unit, this treats modules as
reactive variables.

As such, this is not a drop-in replacement for `require`.

However, it should work with existing `require` calls used by dependencies.

## Example

Live require is used as follows

NO: not like this
```javascript
const { live_require } = require("@def.codes/node-live-require");

const { define, defined, required } = live_require("./some-module");

required.subscribe({
  next(msg) {
    console.log(`Module ${msg.module_id} required ${msg.dependency}`);
  },
});

defined.subscribe({
  next(msg) {
    console.log(`Module ${msg.module_id} was defined, exporting`, msg.exports);
  },
});

define("./some-lib", "module.exports = {version: 1}");
define("./some-lib", "module.exports = {version: 2}");

```


## Usage notes

The live require creates an entrypoint into a dynamic dependency graph.

The entrypoint is distinct from the other modules.  It is expected to be the
locus of outbound effects.

Imported modules should be idempotent, if not effect-free.

## Implementation

As noted earlier, Node's `require` function is not designed to be dynamic.

`require` does not especially provide for extension.

The main problem is that `require` [“wraps” the module
code](https://nodejs.org/api/modules.html#modules_the_module_wrapper) in a
closure that puts a reference to the internal `require` in scope.

Unlike (current-day) browser environments, Node does provide a way to execute
code in a controlled environment.

### Incidentally

Note that while it's okay to use the locally-available version of require.cache,
it's *not* okay to use the local require.resolve, since it depends on the
original path to which its `require` was bound.  In other words:

```
> const other = require('module').createRequire(process.cwd()))
undefined
> require === other
false
> require.cache === other.cache
true
> require.resolve === other.resolve
false
```

This is just the way require works.  I'm not sure why I feel the need to
document it.

## Roadmap

Eventually this will be incorporated into MELD's TypeScript plugin, for an
as-you-type version of the same essential service.
