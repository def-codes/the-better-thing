# Traversals

Maybe a package.  TBD.

I'm not sure that this isn't just about coroutines.  Two stateful things driving
each other.

A traversal is a kind of stateful iterator.

The traversals here use mutable state.

## Motivation

Project MELD is about combating invisibility.

The most basic thing that we need is a way to see things.

Traversal is a necessary prerequisite to representing any composition.

Essentially everything is a composition (composite).

The traversals here are currently oriented towards in-memory object graphs.

In-memory object graphs are inherently invisible.



### Traversals and graphs

Traversals are closely tied with graphs, which are foundational in computing.

Traversal is a kind of graph operation.

A traversal can be used to construct a graph.

A deterministic traversal can be seen as an unrealized graph.

## Traversals and search

Traversal is a kind of search, which is a major area in computing.

Many kind of search can be implemented as dynamic traversals, i.e. that can
modify criteria (spec and even state) at each iteration.

Generators can be used as coroutines in this way.

The traversal functions here currently do not support this kind of usage (but
the Boggle solver, elsewhere around here, does).

## Functional / interfaces

A traversal spec defines how it proceeds against a given input.

A traversal is a function of its state and its spec.

A traversal is resumable given its spec and its state.

## Roadmap

While this is currently focused on traversal of in-memory stuctures, much of the
same will apply to indirect graphs (i.e. those whose links are not “pointers”.)
In particular, datafy/nav.

Which also brings up considerations for async traversals.  A synchronous
iterator can of course be iterated asynchronously.  This becomes necessary if
any of the functions in the spec are themselves async.

Also, keep an eye on this:

- https://github.com/thi-ng/umbrella/tree/master/packages/seq
