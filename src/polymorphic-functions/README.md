# Polymorphic functions in JavaScript

This package provides a mechanism for defining and implementing polymorphic
functions in JavaScript, as well as a means of associating global type
identifiers with runtime values for use in ~~protocol extension~~ their
extension.

Most of the heavy lifting here is done by Karsten Schmidt's
[`@thi.ng/defmulti`](https://github.com/thi-ng/umbrella/tree/master/packages/defmulti)
package, (which is designed after [Clojure’ multimethods and
hierarchies](https://clojure.org/reference/multimethods)).  The difference is
that this package
- focuses solely on type as a dispatch value
- maintains a registry of the (known) prototype hierarchy
- supports type designation through IRI's (based on
  [JSON-LD](https://www.w3.org/TR/json-ld/))
- offers to extend built-in prototypes with IRI's?

## Motivation

Even in an (erstwhile) interpreted language like JavaScript, software paradigms
remain dominated by a static worldview.  

An excellent summary of the problem *vis a vis* Java is given in the [Clojure
reference](https://clojure.org/reference/protocols).

## Challenges

Clojure multimethods provide a way for multiple parties to extend polymorphic
functions and implementations independently.  This is achieved in part via
symbolic references to the types on which multimethods dispatch.  In particular,
Java class names are used as identifiers in multimethod hierarchies, allowing
you to “superimpose new taxonomies on the existing Java class hierarchy”:
```clojure
(derive java.util.Map ::collection)
(derive java.util.Collection ::collection)

(isa? java.util.HashMap ::collection)
```

This can be done without risk of ambiguity because Java classes use a global
namespacing convention (so-called “reverse domains”, like com.foo) for packages.

Alas, JavaScript has no such convention.  Without absolute, canonical names for
modules, how can JavaScript authors yet support this kind of open extensibility?

Note the advice that you should only extend protocols if you “own” either the

type or the protocol.

## Approach

This package uses several strategies for associating unambiguous ID's with
runtime values.  Among other uses, these ID's can be used as dispatch values for
protocols.

## Prior art

Google dump:

- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
- https://github.com/cognitect-labs/transducers-js/issues/20
- https://gist.github.com/modernserf/13846736109de95797d1
- https://github.com/Gozala/protocol
- https://www.jstips.co/en/javascript/protocols-for-the-brave/ (shudder)
- http://tobyho.com/2015/06/23/polymorphism-that-just-works/
- https://ponyfoo.com/articles/javascript-decorators-proposal#marking-special-properties-in-javascript-or-defining-protocols
- https://ponyfoo.com/articles/es6-symbols-in-depth#defining-protocols

## Other notes

Doen't use any ontology w.r.t. `@type`.  i.e. types expressed as IRI's are
flat.  Ontologies could vary between contexts.  `@type` is intended to serve
only as a unique identifier.
