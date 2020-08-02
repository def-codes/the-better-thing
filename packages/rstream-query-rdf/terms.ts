import { PseudoTriple, NodeTerm } from "./api";
import { Term, Variable, BlankNode } from "@def.codes/rdf-data-model";

export const is_node = (term: Term): term is NodeTerm =>
  term.termType === "NamedNode" || term.termType === "BlankNode";

export const is_variable = (term: Term): term is Variable =>
  term.termType === "Variable";

export const is_blank_node = (term: Term): term is BlankNode =>
  term.termType === "BlankNode";

export const map_terms = (f: (t: Term) => Term) => (
  triple: PseudoTriple
): PseudoTriple => triple.map(f);
