// The `Pseudo-` prefix throughout this module reflects the fact that
// PseudoTriple pervades throughout all other types.  I may ultimately decide to
// make the public API compatible with RDF/JS and support the pseudo form for
// convenience in certain places.
import { Term } from "@def.codes/rdf-data-model";

/** A triple compatible with `rstream-query` using RDF/JS terms.  This works as
 * expected as long as equal terms have reference identity. */
export type PseudoTriple = readonly [Term, Term, Term];

type PseudoTriples = readonly PseudoTriple[];

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
