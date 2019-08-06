# AMD loader

This package provides a flexible AMD module loader.

Goals:
- extensible
- visible (provides hooks for later mechanisms to view its workings)
- standalone (no outside dependencies)
- small (for *embedding* in document, not referencing)
- readable (user-facing)
- should be `Promise`-based (but still AMD compatible)
- can be a provider of core functions for use by other modules?

Non-goals:
- support for anything but latest browsers
- out-of-the-box configurability (support indirectly through extension)
  - should be possible to add support for some of RequireJS's config:
    - `paths`

Not sure yet:
- CommonJS (node) support

## Motivation

Module loading is central to MELD.  Existing loaders that implement the AMD spec
(or some subset of it) do not provide sufficient flexibility for a numver of
purposes:

- dynamically determining dependency tree
- intercepting and preprocessing modules (e.g. for “hot loading”)
- reifying script objects

As a secondary matter, existing implementations don't explain how they work.
The source code for `d3-require`, a “minimial” implementation, is about 175
lines.  How does it solve the coordination problem?  One of its few state
variables is an (initially empty) array called `queue`.  How it uses the queue
is not exactly clear.  There is exactly one call to `push` and exactly one call
to `pop`.  (So really it's using `queue` as a stack.)

### Relation to ECMAScript modules

As of 2015, the ECMAScript standard defines a module system.  It is possible
today to use ECMAScript modules in the browser.  (And in Node, though with
notable incompatibilities.)

Why invest energy in a userland module system, rather than exending?

ECMAScript modules, as currently specified (and maybe permanently), lack some of
the extensibility that has long been achievable in userland module systems.  For
example, it is currently not possible using ECMAScript modules to configure
module resolution, to wrap module factories (e.g. to substitute proxies), or to
construct a dependency graph of the modules being loaded.  All of those things
are possible using existing AMD module loaders, which are still widely used.

Today's browsers support anonymous inline modules.  We would also need support
for named modules to map this technique to native modules.  (Is this even
proposed?)


## Implementation notes


### Dependency graph

Dependencies form a graph.

In the case of dynamically-loaded modules, the graph grows monotonically.

Because AMD does not support circular dependencies, we assume that the
dependency graph will remain acyclic.



### The coordination problem

AMD loaders must solve a particular coordination problem.  This section
describes that problem and approaches to solving it.

The web platform has no native mechanism linking the execution context of a
script with its loading context.  In the `define` function, nothing in the
execution context tells us about this script.  Likewise, nothing in the loading
context (which is done through the introduction of a `script` element) allows us
to capture that execution context.

The problem is that, when resolving dependencies, the *name* of the module
exists only in the loading context, and the module factory exists only in the
execution context.  The challenge is to pass control flow back to any and all
consumers of the module *with* the module (i.e. the result of executing the
factory function on *its* resolved dependencies).

Aside: Recent versions of ECMAScript introduce a `meta` element on the `import`
keyword (or on dynamic `import` calls?), and one of the (I presume) motivating
proposals is to include the URL by which the import was requested.  Presumably
this would have a distinguishable value for inline modules, which are currently
supported.)

The challenge is to associating each `define` call with the thing that required
it (if any).  This is tricky because the `define` call is executed without any
context.

### Example flow walkthrough

Here are some scenarios.

#### Files

Let's assume the following modules:

##### `thing-one.js`

```
define(["./lib-one.js"], lib => {
  return { name: "thing one", op: fizz => lib.make("fizz") };
});
```

##### `thing-two.js`

```
define(["./lib.js"], lib => {
  return { name: "thing two", op: buzz => lib.make("buzz") };
});
```

##### `lib-one.js` and `lib-two.js` (separate for illustrative purposes)

```
define(['./common.js'], () => {
  return { make: type => `making ${type}` };
});
```

##### `common.js` (doesn't really matter what's in here)

```
define([], () => {
  return { version: 1 };
});
```

##### `index.js`

```
require(['./thing-one.js', './thing-two.js'], (one, two) => {
  console.log("one", one.op());
  console.log("two", two.op());
});
```

#### Flow

The sequence of events in `index.js` will be as follows:

1. `require` call will attempt to load its dependencies in order.
2. In attempting to resolve `thing-one`,
  1. All dependencies are turned into promises
  2. The cache will be checked, and it will not contain `thing-one`
  3. Therefore, the process of loading thing-one as a module commences
  4. A request for thing-one.js is initiated (which will require `lib-one`)
  5. The promise representing thing-one will resolve when?
  6. The same happens for thing-two, (which will require `lib-two`)
  7. In attempting to resolve `lib-one`, goto 2 with context

Until the scripts are loaded for `thing-one` and `thing-two`, we don't know what
their dependencies are going to be.  And we don't know in what order the scripts
are going to be loaded.

Following is *one example* order.  Other orderings that could occur.  This
example involves a few significant cases.

##### Time: 1.  Start

We launch two parallel requests, one for each dependency.

We have a vector representing the module id's we've requested.

The dependencies are represented by Promises.

HOW ARE THE PROMISES CONSTRUCTED?

We also have a vector of the id's requested.  These id's correspond to the
promises being awaited.  The promises are not retained as such; we just need a
vector of their results.  At the time when this vector resolves (and not
sooner?), we can associate the resolved values with the id's.  Yet... we could
make the association individually.  We don't need to await the whole thing being
done to know that we can “dequeue” one of the dependencies.

##### Time: 2.  `thing-one` load completed

##### Time: 3. `thing-two` load completed

##### Time: 4. `lib-two` load completed

##### Time: 5. `lib-one` load completed

##### Time: 6. `common` load completed

##### We're done

