# sparql-engine-service

This package provides HTTP request handlers that implement standard interfaces
to an RDF 1.1 Dataset via
[sparql-engine](https://callidon.github.io/sparql-engine/).

Specifically, the package aims to provide compliant implementations of:

- [SPARQL 1.1 Protocol](https://www.w3.org/TR/2013/REC-sparql11-protocol-20130321/)

- [SPARQL 1.1 Graph Store HTTP Protocol](https://www.w3.org/TR/sparql11-http-rdf-update/)

**STATUS**: initial wip

Intended for locally-hosted knowledge base service.

## Dependencies

Depends on the packages

- `sparql-engine`
- `n3` (directly and indirectly)
- `sparqljs-legacy-type` (for build only; see note in `sparql-engine` readme)

For now, these are installed in the parent project.
