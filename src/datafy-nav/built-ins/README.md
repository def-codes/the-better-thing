# Datafy/nav implementations for platform built-ins

Status: experimental

The modules in this directory provide basic datafy implementations of several
ECMAScript built-ins.

The modules do *not* perform the extensions automatically, but export functions
that will do so.

This may move to a separate package.

The question of how to map the data fields to IRI's is still being explored.
One possibility is to use unqualified keys but to provide a JSON-LD `@context`
(e.g. on a prototype) that would allow them to be dereferenced.  The drawback to
this approach is that it requires some JSON-LD processing by readers in order to
determine the fully-namespaced properties.
