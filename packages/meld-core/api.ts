import { Term } from "@def.codes/rdf-data-model";

type PseudoTriple = [Term, Term, Term];

interface DriverHandler {}

interface Driver {
  readonly claims: readonly PseudoTriple[];
  readonly rules: { when: PseudoTriple; then: DriverHandler };
}
