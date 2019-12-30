import { TripleStore } from "@thi.ng/rstream-query";
import { PseudoTriple } from "./api";
import { normalize_triple } from "./factory";

/** An extension to `TripleStore` that uses RDF/JS terms with reference
 * equality. */
export class RDFTripleStore extends TripleStore
  implements Iterable<PseudoTriple> {
  add(triple: PseudoTriple): boolean {
    return super.add(normalize_triple(triple));
  }
}
