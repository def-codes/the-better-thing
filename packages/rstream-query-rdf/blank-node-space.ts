// an alternative to this whole apparatus is the Skolem approach
// https://www.w3.org/TR/2014/REC-rdf11-concepts-20140225/#section-skolemization
//
// see also “identifier issuer” and related state
// https://json-ld.github.io/normalization/spec/
import { BlankNode } from "@def.codes/rdf-data-model";
import { factory } from "./factory";

const { blankNode } = factory;

// help to maintain invariant about avoiding blank node collisions
// doesn't support removal (which would require tracking all clients)
export class MonotonicBlankNodeSpace {
  private readonly _bnodes = new Set<string>();
  private _next_id = 0;

  add(bnode: BlankNode) {
    this._bnodes.add(bnode.value);
  }

  /**
   * Return the “next” blank node not present in this space.  If a label is
   * specified, then the node will use that identifier or the first serialized
   * identifier with that prefix.
   *
   * Note that this does *not* actually add the node, although the counter state
   * is incremented when no label is preferred.
   */
  mint(prefer_label?: string): BlankNode {
    if (prefer_label !== undefined && !this._bnodes.has(prefer_label))
      return blankNode(prefer_label);
    const prefix = prefer_label ?? "b";
    // use new ad-hoc counter when label is given
    let counter = prefer_label ? 0 : this._next_id;
    let label: string;
    do label = `${prefix}${counter++}`;
    while (this._bnodes.has(label));
    if (prefer_label) this._next_id = counter;
    // TEMP: add it anyway
    const b = blankNode(label);
    this.add(b);
    return b;
  }
}
