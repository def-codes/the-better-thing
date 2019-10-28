# Expression reader

This package provides tools for reading a subset of JavaScript as structured
expressions, with minimal overhead.

## Motivation

Lisp has never been matched for its balance of a small kernel with power of
expression.

JavaScript is a low-level language



the good parts

yet it is widely available.

late binding and lazy evaluation

motivated by the wish to bootstrap a userland programming environment

combining aspects of Turtle and Lisp.

The intention was never to make a language that is interesting in its own right,
but to leverage an existing host in the service of a dynamic system that could
in turn be used to build more powerful interpreters.

This is a reader only and does not impute any semantics to the constructions it
collects.

term-oriented 


Invariant: proxies should never escape reader.

## Usage

The expression scanner can be used directly from JavaScript code, or indirectly
through dynamically-evaluated text.

Both versions rely on a `Proxy` to support the use of arbitrary terms.

### In kernelspace

```
_ => _.Alice.knows.Bob
```

### In userspace

This works through an (ab)use of the `with` block.



```
Alice.knows.Bob
```

## Concepts

The central thing you can use is the *Term*.  The reader will not recognize
anything that isn't rooted in a Term.

A Term can be chained to another Term using the dot operator.  This creates a
new thing that let's call a Chain.

You can use expressions consisting of *terms*, and *appllications*, and within
applications you can use any expression.

Documentation of capabilities and format.

(See the type definition)

The output structure includes two types of top-level statement: expressions, and
assignments.  An assignment associates an expression with a term.  An expression
is a nested list of elements.  There are three types of element: terms,
applications, and literals.  Literals comprise Arrays, Objects, Primitives, and
expressions.  Both array elements and object key values can be expressions.  For
these purposes, we count lambdas and regexp literals as primitives, since they
are opaque.

This reader is limited by the capabilities of the technique.

While the language is technically JS, the reader is only concerned with what can
be captured by proxies.  In particular, the following constructs are
undetectable:

- control flow (if, for, while, do, try, throw, return, with!)
- declaration (var, let, const, function)
- operators (+, -, *, in, instanceof, typeof, etc)

These constructs can be used inside of lambdas that are captured by the reader,
but they cannot be captured at the top level.  While the reader can't prevent
their use, the result of doing so is undefined.

We can only capture arbitrary terms when they are used against other proxy
expressions.  So, for example,

    A.B

is okay, but NOT

    {}.foo
    [].foo
    "".foo
    (3).foo

As those terms will attempt to resolve against the respective prototypes of the
literal expressions.  The same is true for parenthesized expressions that
resolve to those types.

Note that a similar approach could be taken in Node by using a VM with a Proxy
as the context.  The VM could thus be used in place of the `with` block.
