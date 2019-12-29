import { Term } from "@def.codes/rdf-data-model";
import { PseudoTriple } from "@def.codes/rstream-query-rdf";

interface DriverHandler {}

interface Driver {
  readonly claims: readonly PseudoTriple[];
  readonly rules: { when: PseudoTriple; then: DriverHandler };
}
