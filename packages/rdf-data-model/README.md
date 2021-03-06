# RDF.js data model

This project contains a basic implementation of
the [RDF/JS Data model specification](http://rdf.js.org/data-model-spec/).

## Motivation

As noted in its abstract, this specification “is not a W3C Standard nor is it on
the W3C Standards Track.” I
[strenuously](https://github.com/rdfjs/data-model-spec/issues/143)
[disagreed](https://github.com/rdfjs/data-model-spec/issues/104) with
some of its design decisions (to no avail).  Nevertheless, its goal of
increasing the interoperability of RDF on the web is one that project MELD must
share.

Several RDF.JS Data model libraries are now available.  Because RDF terms are a
core part of MELD, an in-house implementation keeps the core free of
dependencies.  This implementation provides a factory that ensures reference
identity between equivalent terms, which is critical to the present usage
(with
[rstream-query](https://github.com/thi-ng/umbrella/tree/master/packages/rstream-query)).
