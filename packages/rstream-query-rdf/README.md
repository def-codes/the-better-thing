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

## Note

Like `rstream-query`, this is more of an exploratory tool than a work towards a
robust implementation of any standard.  For a complete SPARQL implementation in
JavaScript, see [comunica](https://github.com/comunica/comunica).
