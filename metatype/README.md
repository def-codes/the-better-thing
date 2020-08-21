# Metatype `____________`

Value spaces.

use a kind of typescript hack to capture and pass information from tree
structures into various uses including runtime and compile-time applications.

## MELD note

This is about a mapping between a knowledge representation format (viz, RDF) and
host data structures. Can this be done in a semantics-preserving way?

## proposal

Instead of writing TypeScript types as such, you write concrete data structures
that carry (extensible) descriptions of value spaces.

A system that knows about its runtime types. An extensible way to describe the
shapes of things (extensible with value constraints). That can serve as a source
for TypeScript type definitions _among other_ purposes, including .

## why not use reflection?

There's an unofficial (?) package
[reflect-metadata](https://www.npmjs.com/package/reflect-metadata) or something
like that, that you can use to communicate information between decorations on
things and properties that are readable at runtime

- it doesn't give you a way to extend the definitions (?)

- it's only available on concrete things, i.e. you can't use it to reify the
  definition of a pure interface

- you have to enable decorators

## take one

What we need is a way to talk about types in a way that is available at runtime.

Currently, types are used extensively throughout the codebase for the purpose of
checking / talking about _code_.

These type definitions represent knowledge about the system.

In some cases, this knowledge is only of interest to the codebase. For example,
types related to the app's dataflow and control mechanisms are do not carry any
particular domain interest.

However, many types describe (particularly data record) structures that are of
direct interest to the application domain. There are also lower- or
intermediate-level domains where application types are used in concert with more
general mechanisms. Examples of this include functional components, which need
to be tested with input in a certain shape. Knowing this shape requirement at
runtime is useful for making tools that support dynamic testing of these
components.

Specs can capture information about intended value spaces that goes beyond what
is used (or even recognizable) by the component specification itself. That is
fine. It's a lossy conversion in that direction.
