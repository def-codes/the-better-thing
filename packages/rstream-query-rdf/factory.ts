import { PseudoTriple } from "./api";
import rdf, { Term } from "@def.codes/rdf-data-model";

// Re-export factory so you get identity in all cases
export const factory = rdf;

const { normalize } = factory;

type Trip = [Term, Term, Term];

// We don't use `PseudoTriple` here because it's readonly and the `Triple` type
// used by `TripleStore` is mutable.
export const normalize_triple = ([s, p, o]: PseudoTriple): Trip => [
  normalize(s),
  normalize(p),
  normalize(o),
];
