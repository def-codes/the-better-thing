"use strict";

const { Graph } = require("sparql-engine");
const { Store } = require("n3");

const if_set = term =>
  typeof term === "string" && term.startsWith("?") ? null : term;

// Format a triple pattern according to N3 API:
// SPARQL variables must be replaced by `null` values
function formatTriplePattern(triple) {
  return {
    subject: if_set(triple.subject),
    predicate: if_set(triple.predicate),
    object: if_set(triple.object),
  };
}

function* adapt(iter) {
  for (const quad of iter) {
    yield {
      subject: quad.subject.id,
      predicate: quad.predicate.id,
      object: quad.object.id,
    };
  }
}

class N3Graph extends Graph {
  constructor(store, graph_iri) {
    super();
    // Assumes an n3 store is provided.
    this._graph_iri = graph_iri;
    this._store = store;
  }

  insert(triple) {
    this._store.addQuad(
      triple.subject,
      triple.predicate,
      triple.object,
      this._graph_iri
    );
  }

  delete(triple) {
    this._store.removeQuad(
      triple.subject,
      triple.predicate,
      triple.object,
      this._graph_iri
    );
  }

  find(triple) {
    const { subject, predicate, object } = formatTriplePattern(triple);
    return adapt(
      this._store.getQuads(subject, predicate, object, this._graph_iri)
    );
  }

  clear() {
    this._store.deleteGraph(this._graph_iri);
  }

  estimateCardinality(triple) {
    const { subject, predicate, object } = formatTriplePattern(triple);
    return Promise.resolve(
      this._store.countQuads(subject, predicate, object, this._graph_iri)
    );
  }
}

module.exports = { N3Graph };
