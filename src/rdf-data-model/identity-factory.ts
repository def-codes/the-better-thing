/// an rdf.js implementation that keeps reference identity between equivalent
/// values.  it's built on top of the vanilla impl.
// Shamelessly steals the `id` idea from N3

import { dataFactory as base_factory } from "./factory";
import * as RDF from "./api";

type NormalizeTerm = <T extends RDF.Term>(term: T) => T;

export interface FactoryWithNormalize extends RDF.DataFactory {
  normalize: NormalizeTerm;
}

const id_of = (term: RDF.Term) => {
  switch (term.termType) {
    case "NamedNode":
      return term.value;
    case "BlankNode":
      return `_:${term.value}`;
    case "Variable":
      return `?${term.value}`;
    case "Literal":
      return term.language
        ? `"${term.value}"@${term.language}`
        : term.datatype.value === RDF.STRING_TYPE_IRI
        ? `"${term.value}"`
        : `"${term.value}"^^${term.datatype}`;
  }
};

export const make_identity_factory = (): FactoryWithNormalize => {
  const terms = new Map<string, RDF.Term>();

  // Could be more efficient?  Instantiates the term to get the ID.
  const normalize = <T extends RDF.Term>(term: T): T => {
    const id = id_of(term);
    if (terms.has(id)) return terms.get(id) as T; // we know it will be the same type
    terms.set(id, term);
    return term;
  };

  /** Wrap a term factory function so that it returns identical values for
   * equivalent terms. */
  const wrap_term = <A extends any[], R extends RDF.Term>(
    fn: (...args: A) => R
  ): ((...args: A) => R) => (...args) => normalize(fn(...args));

  return {
    blankNode: wrap_term(base_factory.blankNode),
    // This one already uses a singleton
    defaultGraph: base_factory.defaultGraph,
    literal: wrap_term(base_factory.literal),
    namedNode: wrap_term(base_factory.namedNode),
    variable: wrap_term(base_factory.variable),

    // These don't need to return identical quads, but they do need to return
    // quads with identical terms.
    triple: (subject, predicate, object) =>
      base_factory.triple(
        normalize(subject),
        normalize(predicate),
        normalize(object)
      ),
    quad: (subject, predicate, object, graph) =>
      base_factory.quad(
        normalize(subject),
        normalize(predicate),
        normalize(object),
        normalize(graph)
      ),
    normalize
  };
};
