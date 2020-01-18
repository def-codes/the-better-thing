# rstream-query RDF

This package extends
[@thi.ng/rstream-query](https://github.com/thi-ng/umbrella/tree/master/packages/rstream-query)
with features intended to support a runtime knowledge base:

- use terms compatible with the [RDF/JS](http://rdf.js.org/data-model-spec/)
  (using `@def.codes/rdf-data-model`)
- basic production rules
- feedback rules (forward chaining)

## Status

Under development.  The stable design may or may not expose details of
`rstream-query`, and may thus have a different name.

## Motivation

The `rstream-query` package provides a lightweight tool for storing triples and
computing SPARQL-like queries against them.  Specifically, `rstream-query`
provides queries analogous to the *pattern* and *path* forms of SPARQL
[`SELECT`](https://www.w3.org/TR/2013/REC-sparql11-query-20130321/#select)
queries.

This package builds on that to support operations analogous to SPARQL's
[`CONSTRUCT`](https://www.w3.org/TR/2013/REC-sparql11-query-20130321/#construct)
form.

A general design goal is to avoid introducing new things not described by the
RDF specs.

## Features

### Blank node spaces

Reifies notion of blank node scopes.

Goal is to
- prevent blank node collision, i.e. the uncoordinated mixing of blank node
  identifiers from different sources
- "explicitly provide for the sharing of blank nodes between different RDF
  graphs" (as noted in the [RDF
  Semantics](https://www.w3.org/TR/2014/REC-rdf11-mt-20140225/#shared-blank-nodes-unions-and-merges)
  spec)

Every store is associated (immutably) with exactly one *blank node space*.  A
blank node space is a factory for blank nodes that keeps track of what blank
node identifiers have been used.

Currently the package uses a provides a monotonic blank node space
implementation and a registry of these.

## Note

Like `rstream-query`, this is more of an exploratory tool than a work towards a
robust implementation of any standard.  For a complete SPARQL implementation in
JavaScript, see [comunica](https://github.com/comunica/comunica).
