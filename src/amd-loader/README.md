# AMD loader

This package provides a flexible AMD module loader.

## Background

For over twenty years, Javascript had no official notion of modules.

ECMAScript 2015 introduced first-class modules.  Common browsers now implement
the 2015 spec (`import` and `export` statements and a script `type="module"`),
as well as a later proposal introducing dynamic imports (via asynchronous
`import()` expressions).

These proposals were aimed at solving the set of problems associated with
existing module loading systems.  One module system dominated each of the two
main environments: AMD for the browser, and CommonJS for Node.

For browser environments, the Asynchronous Module Definition (AMD) effectively
filled the module gap for many years. Significantly, AMD is a *userland*
protocol.  AMD is still used very widely and is baked into interop systems (such
as UMD) that make a large ecosystem of modules available.

It is necessary to point out that what has replaced AMD in common practice is
*not* another module loader, but a re-framing of the whole problem that makes
module-loading more of a development and deployment concern, rather than a
userland operation.  In particular, development servers that serve module
content “dynamically” in effect obscure the semantics of client-side code that
deals with dependencies.  This approach moves away from a dynamic worldview
towards a more static view, where package needs are a one-time, up-front
decision.

So it is no surprise that when we look at ECMAScript 2015 through the lens of
visibility-by-default and our other core values, we find gaps in the story.

How do we construct a dependency tree?

How do we configure module name resolution?

(Of course, custom module name resolution may be one of the things that the
proposal aims to diminish, as it does reduce portability (assuming that you
can't also ship the custom logic)).

Can we (and should we) change the semantics of these globals, just because (by
intercepting them) we can?  Intuitively, it seems folly to change the semantics
of any well-defined thing.  Yet there are ways that we can "advise" the
implementation in a fundamental way while still providing a meaningful outcome.

Let's consider the notion of a "module loader" in the context of a live system.

    But this starts getting into the deep-proxy territory, which is fine but a
	separate package

In a live programming system (such as is common to Lisp environments), name
resolution is late-binding.  You can redefine functions any number of times, and
you don't have to re-declare any things that referenced them earlier.

I see two ways to deal with this in JavaScript (which does not have such late
binding).

You can use a proxy for things that will need late binding of their members.
This approach is well-suited to module definitions.

You can also use a dataflow, in which re-declarations of modules trigger updates
in downstream nodes, which are re-evaluated using the new definitions.  Modules
with multiple dependencies are modeled as sync nodes.

The main difference between these two approaches is that one results in the
frequent reëvaluation of factory functions.



## Prior art

RequireJS has been the *de facto* AMD loader for many years.  It is stable and
has many configuration options with practical value.

d3-require is a minimal AMD implementation used by the d3 family of packages.
This implementation owes much to `d3-require`.

## Goals

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
(or some subset of it) do not provide sufficient flexibility for a number of
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

Why invest energy in a userland module system, rather than extending?

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

AMD loaders must solve a particular coordination problem.  `define` is
essentially a coordinator tailored to this situation.  This section describes
that problem and approaches to solving it.

The web platform has no native mechanism linking the execution context of a
script with its loading context.  In the `define` function, nothing in the
execution context tells us about this script (such as how it got here).
Likewise, nothing in the loading context (which is done through the introduction
of a `script` element) allows us to capture its ultimate execution context.

The problem is that, when resolving dependencies, the *name* of the module
exists only in the loading context, and the module factory exists only in the
execution context.  The challenge is to pass control flow back to any and all
consumers of the module along *with* a reference to the module itself (i.e. the
result of executing the factory function on *its* resolved dependencies).

Aside: Recent versions of ECMAScript introduce a `meta` element on the `import`
keyword (or on dynamic `import` calls?), and one of the (I presume) motivating
proposals is to include the URL by which the import was requested.  Presumably
this would have a distinguishable value for inline modules, which are currently
supported.)

The challenge is to associate each `define` call with the thing that required it
(if any).  This is tricky because the `define` call is executed without any
context.

What makes it possible to capture the execution context of a loaded script?
`define`.

The global `define` and `require` functions serve as the means of coordination
between module definitions and those of their imports.

Since such entities must be global, they cannot be contextualized for the
purpose of tracking concurrent execution contexts.  Yet it is essential to track
the context somehow.  Where does the module name match up with the declaration
of its dependencies?  That is a matter of interest at the meta-level.  The spec
doesn't provise for this being possible.

I finally see how d3-require copes with this.  It uses a pushdown stack plus the
fact that when a script's `onload` handler is called, the most recent thing to
have run will be the script that it loaded.  So `define` pushes its factory
output onto a stack, and the first thing to execute following that will be (we
happen to know) the script's `onload` handler.

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

## Other viewpoints

AMD makes claims about two global names: `define` and (optionally) `require`.

Just as we tapify the console in `@def.codes/console-stream`, we have reason to
extend AMD's well-known objects.

If we can talk about concepts like modules and dependencies, then those things
should be reified.

The domain implies the existence of a dependency graph, yet we cannot actually
construct (that is, we cannot know) the dependency graph.

We also have no way to know when these things are occuring.

Let's suspend our view of the module loader as such.

Looking topologically at what's going on:

- we reference a well-known global
- using a well-known signature
- we reference by name some other things
- and we provide a function whose parameters correspond semantically to the
  vector of referenced things
- we take the invocation of that well-known global as a command to make
  something happen now.  (indeed, we have no other way to capture this intent)
- the thing that it asks to happen is the invocation of that function with the
  somehow-interpreted values of the referenced things

## Taking it apart

An AMD loader *can* load all dependencies without executing them.

The execution context in which dependencies are declared is isolated from that
in which things are provided.

## is `define` like a Lisp macro?

Macros are applied at compile time, not evaluation time.

In-flight script loads in which a `define` is expected must be contextualized
for the sake of the factory.

## would it break the spec to make `define` lazy wrt factory and `require` eager?

Intuitively, `define` should not have side-effects.

Turns out this has already been discussed:
https://groups.google.com/forum/#!topic/amd-implement/-z-Umb-cz4o


## Related

https://html.spec.whatwg.org/multipage/dom.html#dom-document-currentscript
https://www.npmjs.com/package/lockandload (https://github.com/BuGlessRB/lockandload#readme)
