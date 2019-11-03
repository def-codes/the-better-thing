# Node web presentation

> Not sure what to call this.  It's for extracting the part of the playgrounds
> plugin that doesn't have to do with the typescript plugin system per se.  This
> will probably be subject to further decomposition.

Support the use of a browser-based presentation layer for systems running inside
of a node process.  This requires the use of a system supporting a compatible
interface.

## Motivation

Processes are invisible.  *Some* processes run in an environment where a
*presentation layer* is attached.  In the browser, the presentation layer is the
current document.  In text-based terminals, the presentation layer is the
pseudo-terminal.  The latter type of process is limited to printing text to
`stdout` and `stderr`, which may include foreground and background colors in
some environments but is generally limited to monospaced characters.  Finally,
processes running in the background are no longer attached to any kind of
presentation layer that the user can see.  In any case, text-based output is not
sufficient for presenting the range of information that might be relevant in a
given process.  While the browser (and other graphics facilities) offers a
richer set of graphic and audio features, not to mention capabilities for
communicating input back from the user.

Processes need to be visible, period.  Many proceses are not designed to be
observable in a useful way, which is a problem in its own right.  But those that
do should not be unable to present themselves just because they do not happen to
run in an environment that happens to include a built-in presentation layer.


## How it works


## Usage

How would this be used?

The expectation is that
- programs (i.e. standalone JS files) can benefit this *without specifically
  referencing this package*
- programs *do* need to implement *some* kind of interface for this kind of
  hands-off presentation to be possible
- programs can be visualized by
  - referencing and using this package directly
  - being loaded *by* this package indirectly 

Processes implementing a given interface 

## Story one: use this package directly

```typescript
const nwp = require("@def.codes/node-web-presentation");
// this is the easiest way to connect with the intended output
// but doesn't it mean you get this output whether you want it or not?
// or, you can open the browser conditionally and just say
// hey, if you want to see what's going on with this proc
// just browse to localhost:1235

```

## Story two: be loaded by this package


```typescript
const pt = require("@def.codes/process-tree");
// you use process tree to build your system
// which means that you should have an outlet
// but you need to have some way to publish it

```


## Story three: have this package attach to a running process


```typescript
const pt = require("@def.codes/process-tree");
// you have to connect to some process
//   or you can use some special node mojo
// and then you can run this CLI after the fact and detect it
```
