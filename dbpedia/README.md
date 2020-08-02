# dbpedia

Here be experiements with dbpedia, which is a large collection of RDF triples,
much of which is ported over from Wikipedia (think infoboxes).

## objective

A soup-to-nuts dbpedia setup for any system with Apache Jena installed. In other
words, it won't install Jena but it will

- download dbpedia RDF files (TBD)
- unzip dbpedia RDF files (kinda TBD)
- start a Fuseki server
- import (at least some of) the dbpedia source files (TBD)

## motivation

MELD's goal is to create knowledge-based software systems for userland modeling
in the dynamic medium. Many of the related domains don't have the requisite
vocabularies, and thus much of the project's focus is on determining what those
vocabularies should be, developing models that use them, and implementing
software interpreters for them.

However, much of the _extant_ knowledge (in RDF form) is concerned with general
knowledge. There is also a use for having general means of displaying and
navigating knowledge graphs with no particular foreknowledge of their content or
structure. The goal here is thus to use focus on the display and navigation of
an arbitrary pre-existing (and effectively read-only) graph, using dbpedia as a
large test case.

## prior art

Several systems have been designed to support the general navigation of
knowledge bases. The web site dbpedia.org is itself devoted to supporting the
exploration of the dbpedia dataset specifically (though in principle it couid be
used for any dataset).

TBD link to a paper that provided a set of SPARQL queries that it uses to
determine the top-level ontology contained in a dataset, from which subsequent
(parameterized) queries could be determined.

## prerequisites

You must have Apache Jena (and hence Java) installed.

## usage

Set the environment variable `DBPEDIA_HOME` to the directory to use for Fuseki's
working files.

Set the environment variable `DBPEDIA_FUSEKI` to the directory to use for
dataset storage.

Then run

```sh
dbpedia/start-fuseki.sh
```
