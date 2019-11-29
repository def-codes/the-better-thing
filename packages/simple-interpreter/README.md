# Simple interpreter

This package provides a synchronous, userland interpreter of rudimentary
expression structures.


## Motivation

All modeling is language design.  The beauty of computers is that you can use
them to turn new languages into real things: simulations, solvers, and even
environments.

Even “simple” languages can be highly expressive.  Interpreters for such
languages may be very complex.

One way of coping with this complexity is by building more powerful languages on
top of less powerful ones.  At bottom, then, we would expect to see a simple,
minimally-powerful interpreter designed to bootstrap more special-purpose
languages.  This design is the essence of Lisp.  This package is just another
validation of Greenspun's tenth law.

## Design

The goals of language support cannot be achieved without late binding and lazy
evaluation.  Alas, JavaScript is not Lisp.  This package does the minimum needed
to provide those facilities in userland over JavaScript.

The supported expression structures are a small subset of those expressible in
JavaScript.  It's largely an inverse of the constructs recognized by `Proxy`
traps.
