// The `Pseudo-` prefix throughout this module reflects the fact that
// PseudoTriple pervades throughout all other types.  I may ultimately decide to
// make the public API compatible with RDF/JS and support the pseudo form for
// convenience in certain places.
import { Term, NamedNode, BlankNode } from "@def.codes/rdf-data-model";
import { QuerySpec, QuerySolution } from "@thi.ng/rstream-query";

/** A triple compatible with `rstream-query` using RDF/JS terms.  This works as
 * expected as long as equal terms have reference identity. */
export type PseudoTriple = readonly [Term, Term, Term];

export type PseudoTriples = readonly PseudoTriple[];

export type NodeTerm = NamedNode | BlankNode;

/** To be used with `rstream-query`, at least one of the terms must include a
 * variable. */
export type PseudoPatternQuery = PseudoTriples;

// Theoretically could support, e.g. retract or other operations
interface PseudoRuleAction {
  readonly assert: PseudoTriples;
}

export interface PseudoRule {
  readonly when: PseudoTriple;
  readonly then: (bound_variables: object) => PseudoRuleAction;
}

type DeepReadonly<T> = T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

// Very preliminary.  Right now mostly represents the parts of
// @thi.ng/rstream-query TripleStore that I was using anywhere.
export interface IRDFTripleSource {
  readonly triples: Iterable<PseudoTriple>;
  addQueryFromSpec(spec: DeepReadonly<QuerySpec>): QuerySolution;
  subjects(): Set<NodeTerm>;
}
export interface IRDFTripleSink {
  add(triple: PseudoTriple): void;
  into(triples: Iterable<PseudoTriple>): void;
  import(triples: PseudoTriples): void;
}
