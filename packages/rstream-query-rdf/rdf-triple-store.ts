import { TripleStore } from "@thi.ng/rstream-query";
import { PseudoTriples, PseudoTriple } from "./api";
import { normalize_triple } from "./factory";
import { MonotonicBlankNodeSpace } from "./blank-node-space";
import { blank_node_space_registry } from "./blank-node-space-registry";
import { is_blank_node, map_terms } from "./terms";
import { BlankNode } from "@def.codes/rdf-data-model";

/** An extension to `TripleStore` that uses RDF/JS terms with reference
 * equality. */
export class RDFTripleStore extends TripleStore
  implements Iterable<PseudoTriple> {
  readonly blank_node_space_id: number;
  private readonly _bnode_space: MonotonicBlankNodeSpace;

  constructor(triples?: PseudoTriples, bnode_space?: number) {
    // Can't add triples until bnode_space is defined.
    super();

    if (typeof bnode_space === "number") {
      this.blank_node_space_id = bnode_space;
      this._bnode_space = blank_node_space_registry.get(bnode_space);

      if (!this._bnode_space)
        throw new Error(`No such blank node space ${bnode_space}`);
    } else {
      const { space, id } = blank_node_space_registry.create();
      this._bnode_space = space;
      this.blank_node_space_id = id;
    }

    if (triples) this.into(triples);
  }

  // Assumes bnodes are from same space (as with `into`).
  add(triple: PseudoTriple): boolean {
    const normalized = normalize_triple(triple);
    // Strict RDF does not allow bnodes in predicate position, but this
    // registers them anyway.

    for (const term of normalized)
      if (is_blank_node(term)) this._bnode_space.add(term);
    return super.add(normalized);
  }

  into(triples: Iterable<PseudoTriple>) {
    // @ts-ignore: this is here just to adapt th signature
    return super.into(triples);
  }

  /**
   * Add triples from a different blank node space.  Like `into`, but maps
   * incoming blank nodes to new ones minted for this space.
   */
  import(triples: PseudoTriples) {
    // create a distinct mapping for each bnode in the incoming triples
    // yeah we have various utilities
    const map = new Map<BlankNode, BlankNode>();
    // Strict RDF does not allow bnodes in predicate position, but this
    // maps them anyway.
    return this.into(
      triples.map(
        map_terms(term => {
          if (!is_blank_node(term)) return term;
          if (!map.has(term)) map.set(term, this._bnode_space.mint(term.value));
          return map.get(term);
        })
      )
    );
  }
}
