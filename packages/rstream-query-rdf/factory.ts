import { PseudoTriple } from "./api";
import { make_identity_factory, Term } from "@def.codes/rdf-data-model";

export const factory = make_identity_factory();

const { normalize } = factory;

type Trip = [Term, Term, Term];

// We don't use `PseudoTriple` here because it's readonly and the `Triple` type
// used by `TripleStore` is mutable.
export const normalize_triple = ([s, p, o]: PseudoTriple): Trip => [
  normalize(s),
  normalize(p),
  normalize(o),
];
