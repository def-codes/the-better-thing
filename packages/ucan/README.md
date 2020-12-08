# ucan

This document contains some true statements about `ucan`, which is a userland.

## Technical elevator pitch

RDF is bytecode. `ucan` is its userspace.

## Direct dependencies

You can use `ucan` if you have

- ws (socket server)
- sparql-engine
- level / levelgraph (for persistence)

> Then again, the system could fetch these packages itself, if they are not
> present. Or install them, though that's a bit creepy. Either it gets them from
> the global install, or maybe it puts them in the home directory.

## Getting started

You can install `ucan` in an npm:project

```sh
npm install ucan
```

You can install `ucan` globally:

```sh
npm install --global ucan
```

## Using `ucan` as a library

You can import `ucan`.

```typescript
import { anything } from "ucan";
```

You can refer to the source code for API documentation.

## Concepts

`ucan` provides compute primitives (things) that maintain useful invariants:

- portable
- inspectable
- visible
- recomposable
- self-documenting
- queryable

### Things

You can say things and do things

You can make things and see things.

You can move things around in space.

You can look at things from another point of view.

You can share things.

You can make statements about things.

### Worlds

You can think of a world as a conceptual space.

You can think of there being multiple worlds.

You can see multiple worlds at once.

You can think of worlds as having things in them.

You can conceive a world where anything you say is true, or should be.

You can imagine spending resources to make the world as you say it should be.

You can think of your local machine as a world. Maybe you already do.

#### Open worlds

An "open" world is one where anyone can claim anything.

You can think of the world we live in as "open" in that sense.

#### Closed worlds

In a "closed" world, we can say that something will never be true.

You can think of closed worlds as easier to think about.

### U-space

You can think of U-space as “universe space.”

`ucan`'s invariants are maximized in U-space:

- userspace models have least input into process

### Graphs

You can think of a graph as a model of the world.

### Domains

### Knowledge base

You can think of `ucan` as a knowledge base

You can query `ucan`.

### Interpretation

You can send `ucan` messages.

You can define processes that listen to the messages sent to ucan.

#### Execution model

#### You can say `this:`

Against everyone's better judgement.

You can say `this:graph` to refer to... the graph in the execution context.

> What if this fact is shared by many graphs?

Yes, RDF does not include a way to talk about the

### Processes

You can see the state that a process is in.

You can describe a process.

#### Workflows

You can think of a workflow as a description of a process, like a recipe.

#### Execution

### Patterns

Because everything is a fact

### Rules

#### Construct rules

You can interpret (`ucan`-flavored) SPARQL CONSTRUCT as a rule.

`ucan` construct rules have the most expressive power of any declarative format
provided by the core system.

> Technical note: live update is possible for a limited subset of SPARQL
> operations. Detection of input change notification will not always be
> possible.

A construct rule combines an input query with an output template.

Facts can be matched by patterns, with logical grouping, filters, etc.

#### Rule-based representation

### Activities

### Reification

Reification: making real things

Make processes real.

Make structures and substructures real.

## You can use files

### You can use Turtle files (`.ttl`)

### You can use SPARQL files (`.sparql`)

### You can define your own rules

## What `ucan` does

`ucan` creates a system

`ucan` starts a process

`ucan` looks for other ucan processes

`ucan` comprises a collection of processes, with one distinguished?

## `ucan` views

You can visit `ucan` with your browser.

You can

## You can call `ucan`

When called from a terminal, the command interprets the call by the `ucan:shell`
protocol.

By default, the `ucan:shell` protocol launches a browser with a `ucan` view.

Calling `ucan` with no arguments from a shell launches a browser that acts as a
window to a world.

As with global protocols generally, you can subscribe to `ucan:shell` calls.

### Nesting worlds

A world can be the union of other worlds.

`.ucan` projects are worlds.

By default, `.ucan` projects see a default graph (U-space) shared by all other
projects.

## `ucan` context

You can think of knowledge base as a collection of claims about a world.

## You can configure `ucan`

You can configure `ucan` globally through `~/.ucan`

`~/.ucan` is interpreted under the `ucan:home` protocol.

> Where does the `ucan:home` protocol come from, if not from home? It's already
> known by the `ucan` process that does the interpretation. If at startup a
> `ukan:home` was not restored from persistence, a default one is initialized
> from the `ucan` distributable.

You can define the `ucan:home` protocol in your home directory.

The home protocol is defined by a workflow.

Which could be defined in this document

```turtle
this:model do:steps () .
```

The home protocol states that

If `~/.ucan` is a directory, then it is interpreted according to the workflow
that matched it.

## `ucan` remembers

You can persist your knowledge base to your local hard drive.

The knowledge base is persisted automatically (to the `~/.ucan.d/index`
directory) when the application stops.

## `ucan` projects

You can use `ucan` in a directory.

- you may have specific files there that you want to treat specially

The `.ucan` entry in any directory is treated similarly to that in the root,
with additional context.

## You can `ucan` as a TypeScript plugin

Or at least, that was the idea for a while. At this point, could it talk to
`tsserver` instances without needing to do that?

## `ucan` host object

`ucan` creates a singleton global in the browser.

You can use the `ucan` object in the browser console to talk to `ucan` directly.

You can issue commands by applying to the `ucan` object.

You can create expressions by keying off of the `ucan` object.

> I don't think there is a way to tell when the object is being accessed from
> the browser console versus somewhere else.

You can access the ucan global from lambda functions.

## You can get service

Security considerations.

There must be some kind of permission model for things to execute code on your
machine.

The `SERVICE` keyword can be used with `ucan:foobar` to request permission for
various host services.

For example, you can ask for permission to use

- file system
- spawn process
- git access
- asdf

## How ucan works

For example, I want to put a diagram into this document.

I have an idea of something...

A diagram of what?

```

```

## What are the big ideas

- hybrid, compositional integration/constraint layout
- live declarative reactive dataflow
- live query federation
- live pattern matching via unified stream joins
- datafy protocol (Clojure): runtime mapping host objects to linked data

## Applications

### live literate programming

Traditional build systems are not designed for literate programming.

## Keywords

- knowledge engineering
- declarative programming
- live programming
- process modeling
- rule-based representation
- constraint optimization
- simulation
