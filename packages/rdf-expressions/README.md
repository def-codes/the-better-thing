# RDF expressions

This package provides an extension to the MELD expression reader that supports
the writing of RDF constructs.

## Motivation

The MELD project is motivated by a need to bring powerful modeling tools to
userland.  This extension is motivated by the need to include Knowledge
Representation (KR) among those tools.

Research has consistently shown that, for the purpose of modeling, people find
*declarative statements*, including facts and rules, easier to understand and
work with than imperative commands.  When used in conjunction with relevant and
purpose-built vocabularies, declarative statements and rules can offer
expressive power consummate with the imperative, procedural approaches that many
people find inaccessible.

The [Resource Description Framework](https://www.w3.org/TR/rdf11-concepts/)
(RDF) is a family of technologies that provides a simple, global data model for
knowledge representation across arbitrary domains.  MELD introduces a runtime
for userland modeling that is based on an RDF knowledge base.

In order to leverage the power of a knowledge-based runtime, it is essential
that users have a way to directly state facts and relationships.  This can be
accomplished by embedding a “terse triple language” into userland code.

While it is *not* a goal of this project to grow the userland language beyond
its present definition, this extension serves as part of the low-level
foundation needed to bootstrap more powerful interpreters (including non-textual
interfaces).

## Design

The RDF interpreter in this package does not introduce any new concepts for the
expression of triples.  Instead, it closely parallels the notations available in
the [RDF Turtle language](https://www.w3.org/TR/turtle/).  Designed as a “terse
triple language,” Turtle's notations include shorthands for succinctly writing
common structures used in a triple store.  The [features](#features) section
describes those constructs and their equivalents.

## Syntax

The expressions defined here are syntax-agnostic.  The [usage](#usage) section
describes how the tool can be used with both source code and in-memory
structures.

Examples in this document use the MELD userland code syntax.  See that package's
documentation for details.

(Link TBD)

## Grammar

The RDF expressions described here do not have a formal grammar as such.
However, they can be understood in terms of a few simple rules.  This section
describes the forms that are used consistently throughout the language.

### Expression construction

As described in the expression-reader package, all expressions begin with a
term:

```
A
```

Expressions are formed by the attachment of new expressions:

```
A(B)
A(B(C))
```

In this extension, we are generally using terms to notate triples:

```
Subject(Predicate(Object))
```
### Expression expansion

We say that an expression “expands” when it produces multiple triples.

For example, the expression

```
Subject(Predicate(Object1, Object1))
```

expands to

```
Subject(Predicate(Object1))
Subject(Predicate(Object2))
```

Supported expansions are described in the [features](#features) section.

### Dot notation

As a special case, extensions involving a single, named term, can be expressed
in a shorter form.

For example, the expression

```
A(B)
```

can be written as

```
A.B
```

This is just a convenience and does not change the meaning in any way.

### Context

Unlike Turtle, which uses different syntax for different constructs, this system
overloads the same structures for several purposes.  This section defines the
*contexts* recognized by the reader and how they are used to disambiguate
expressions where necessary.

#### Predicate position

A *predicate position* is a place where a subject is already in context and a
predicate-object pair (or list of pairs) is expected.

```
Alice(/* This is predicate position  */)
```

In predicate position, a predicate-object list is interpreted as a set of
predicates to associate with the containing subject:

```
Alice(likes.Bob, loves.Carol)
```

An object list would not be meaningful in predicate position:

```
Alice(Bob, Carol, 123) // nonsense
```

#### Object position

An *object position* is a place where a subject and predicate are already in
context and an object (or list of objects) is expected.

```
Alice.knows(/* This is object position  */)
```

In object position, everything is interpreted as a standalone value.

Literal values and terms are unambiguous:

```
Alice.alias("Ali", "Alicia")
Alice.knows(Bob, Carol)
```

Predicates *are* meaningful in object position; they are interpreted as *blank
nodes*:

```
Alice.knows(a.Prince, a.Pauper)
```

In all cases, the resulting objects are associated with the containing
subject-predicate:


```
Alice.alias("Ali")
Alice.alias("Alicia")
Alice.knows(Bob)
Alice.knows(Carol)
_b1.a.Prince
Alice.knows(_b1.a.Prince)
_b2.a.Pauper
Alice.knows(_b2.a.Pauper)
```

## Features

The facility offers a subset of the languages features identified in Turtle
spec.  This section reviews the supported features and provides examples of
each.

Additional features:

- usage in “kernel” code through lambdas (noted in [usage](#usage))
- handling of non-plain objects
- variables (TBD) Like SPARQL (as noted
  in
  [section §4, “Turtle compared to SPARQL”](https://www.w3.org/TR/turtle/#sec-diff-sparql)),
  terms prefixed with `$` are read as RDF variables.


### Simple Triples

[(2.1) Simple Triples](https://www.w3.org/TR/turtle/#simple-triples)

> The simplest triple statement is a sequence of (subject, predicate, object)
> terms

```
Alice(knows(Bob))
```

### Predicate lists

[Predicate lists (§2.2)](https://www.w3.org/TR/turtle/#predicate-lists)

> Often the same subject will be referenced by a number of predicates.

The reader expands subjects over predicate-object lists.

```
Alice(knows(Bob), loves(Carol))
```

expands to

```
Alice(knows(Bob))
Alice(loves(Carol))
```

### Object Lists

[(§2.3) Object Lists](https://www.w3.org/TR/turtle/#object-lists)

> As with predicates often objects are repeated with the same subject and
> predicate. The objectList production matches a series of objects... following
> a predicate. This expresses a series of RDF Triples with the corresponding
> subject and predicate and each object allocated to one triple.

The reader expands subject-predicates over object lists.

```
Alice.knows(Bob, Carol)
```

expands to

```
Alice.knows(Bob)
Alice.knows(Carol)
```

### IRI's

[(§2.4) IRIs](https://www.w3.org/TR/turtle/#sec-iri)

TBD: prefixes (pseudo-curies)

### RDF Literals

[(2.5) RDF Literals](https://www.w3.org/TR/turtle/#literals)

This is somewhat covered automatically by the availability of JavaScript
literals (and literal expressions) in object positions.

TBD: language tags
TBD: datatypes

### Blank Nodes

This covers the following two sections

- [(§2.6) RDF Blank Nodes](https://www.w3.org/TR/turtle/#BNodes)
- [(§2.7) Nesting Unlabeled Blank Nodes in Turtle](https://www.w3.org/TR/turtle/#unlabeled-bnodes)

Blank nodes (i.e. anonymous nodes) are created from a standalone
predicate-object pair in an [object position](#object-position).

```
a.Poet
We.areHiring(a.Tinker, a.Tailor, a.CandlestickMaker)
```

TBD: there is not currently a way to make explicitly-named blank nodes, and I'm
not sure that I want to introduce one (if you're naming something, just name it)

TBD: there is not currently a way to use (implicit) blank nodes in the subject
position.

### Collections

[(§2.8) Collections](https://www.w3.org/TR/turtle/#collections)

Turtle offers a notation for constructing RDF lists.

## Usage

The package exports a function called `as_triples` which takes output from the
MELD expression reader and produces a collection of (pseudo) triples:

```
import { read } from "@def.codes/expression-reader"
import { as_triples } from "@def.codes/rdf-expressions"

const triples1 = as_triples(read("Alice.knows.Bob"));
const triples2 = as_triples(read("Alice(knows(Bob, Carol))"));
```

Note that this is equivalent to:

```
import { with_scanner } from "@def.codes/expression-reader"
import { as_triples } from "@def.codes/rdf-expressions"

const triples1 = as_triples(with_scanner(_ => _.Alice.knows.Bob));
const triples2 = as_triples(with_scanner(_ => _.Alice(_.knows(_.Bob, _.Carol))));
```

## Reserved constructs

This section defines contructs that are currently unrecognized by the
interpreter but which may be defined in later revisions.

### Empty argument lists

Terms with empty argument lists do not have any special meaning, and should fail
to be interpreted as things stand:

```
A()
```

I'm making a note of this because I'm still looking for an unambiguous way to
represent blank nodes.

### Successive argument lists

Similarly,

```
A(B(C))
```

is distinguishable from

```
A(B)(C)
```

That construction should likewise fail to be interpreted, though it seems like
there could be some use for it.

That said, if you follow the axiom that `A(B)` is the same as `A.B`, then it
would appear that the above reduce to the same thing.
