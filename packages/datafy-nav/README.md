# Datafy/nav

This package provides two functions: `datafy` and `nav`, based on the ideas
behind [the (alpha) `datafy` namespace introduced in Clojure
1.10](https://clojure.github.io/clojure/branch-master/clojure.datafy-api.html).

## Motivation

Data is visible.  Everything else in computing is invisible.  Today's
programmers deal largely with the latter kind.  This dealing is done through the
imagination, by sustaining a mental model of what points to what, and what
subterranean things might have caused what effects.  This invisibility is even
more severe on remote systems.

From this perspective, the datafy protocol is simply a way of making invisible
things visible---or at least visualizable.  Instead of “the thing,” you get a
description of the thing.  In some cases, this description may be sufficient to
reconstitute an equivalent thing elsewhere; as such, datafy also offers a story
on portability for some kinds of things.

Userspace is a hosted environment.  In the browser, the script engine is the
host.  Just as Clojure sees the JVM as its host, MELD sees the JavaScript
runtime as a host.

## Concepts

The main ideas (as I see them) are:
- single protocol for inspection and traversal of (potentially remote) runtime
  objects
  - without direct runtime references
- encourage linked-data paradigm
- bottom out on data, supports visibility
- remotable
- general and dynamic: can be used as an incremental computation protocol

datafy/nav:
- standalone protocols
  - independent from processes
  - independent from rdf
  - independent from subsystems, composition, etc
- provides a way to traverse anything
  - in a way that resembles object graphs
  - but without needlessly leaking object references
- applications / things we know would be datafiable/navigable
  - plain data
  - the system
  - dom elements
  - generally any resources from built-in api's (web audio, etc)
  - processes (including across workers and even remote over sockets)
  - the triple store (the canonical linked data)
  - subscriptions and streams
  - channels
  - subscription/channel sync and merge nodes?
  - pipelines between channels? (they are not even a runtime thing as such)
    - yet they are like a process
  - fsm
  - interceptor bus

## Implementation

These functions are `polymethod`'s that use the
`@def.codes/polymorphic-functions` package to support dynamic extension.

## Open questions

What does datafy return as the value of a key when that key is an object,
something that you don't want to traverse into.  The whole point is about not
leaking object references.  Something you need to nav into.
