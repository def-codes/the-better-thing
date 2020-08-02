import * as tx from "@thi.ng/transducers";
import { stream, ISubscribable } from "@thi.ng/rstream";
import { TripleStore, Edit } from "@thi.ng/rstream-query";
import {
  NodeTerm,
  PseudoTriples,
  PseudoTriple,
  IRDFTripleSource,
  IRDFTripleSink,
  IRDFTripleEvents,
} from "./api";
import { normalize_triple } from "./factory";
import { MonotonicBlankNodeSpace } from "./blank-node-space";
import { blank_node_space_registry } from "./blank-node-space-registry";
import { is_blank_node, map_terms, is_node } from "./terms";
import { BlankNode } from "@def.codes/rdf-data-model";

/** An extension to `TripleStore` that uses RDF/JS terms with reference
 * equality. */
export class RDFTripleStore
  implements IRDFTripleSource, IRDFTripleSink, IRDFTripleEvents {
  readonly blank_node_space_id: number;
  private readonly _store = new TripleStore();
  private readonly _bnode_space: MonotonicBlankNodeSpace;
  private readonly _added = stream<PseudoTriple>();
  private readonly _deleted = stream<PseudoTriple>();
  private readonly _subject_streams = new Map<
    NodeTerm,
    ISubscribable<Iterable<PseudoTriple>>
  >();

  constructor(triples?: PseudoTriples, bnode_space?: number) {
    // Can't add triples until bnode_space is defined.
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

    // The triples are assumed to be from the same bnode space as the one given,
    // if one was given.  I'm not sure it's a good idea to accept triples in
    // this constructor.
    if (triples) this.into(triples);
  }

  has(triple: PseudoTriple): boolean {
    // @ts-expect-error: adapts signature
    return this._store.has(triple);
  }

  get triples() {
    return this._store.triples;
  }

  subjects() {
    return new Set(this._store.indexS.keys());
  }

  // Constructs a new set every time...
  nodes() {
    return new Set(
      tx.concat(this.subjects(), tx.filter(is_node, this._store.indexO.keys()))
    );
  }

  subject(id: NodeTerm): ISubscribable<Iterable<PseudoTriple>> {
    // This is kind of like a pubsub on indexS
    if (!this._subject_streams.has(id)) {
      // TS: inference usually fails on transducer pipelines
      const sub = this._store.streamS.transform<Edit, Iterable<PseudoTriple>>(
        tx.filter(edit => edit.key === id),
        tx.map(edit => tx.map(n => this._store.triples[n], edit.index))
      );
      // Fake an edit for this subject so new subscribers get current value.
      sub.next({ key: id, index: this._store.indexS.get(id) });
      this._subject_streams.set(id, sub);
    }

    return this._subject_streams.get(id);
  }

  addQueryFromSpec(spec) {
    return this._store.addQueryFromSpec(spec);
  }

  added() {
    return this._added;
  }

  deleted() {
    return this._deleted;
  }

  // Assumes bnodes are from same space (as with `into`).
  add(triple: PseudoTriple): boolean {
    const normalized = normalize_triple(triple);
    // Strict RDF does not allow bnodes in predicate position, but this
    // registers them anyway.

    for (const term of normalized)
      if (is_blank_node(term)) this._bnode_space.add(term);
    const was_added = this._store.add(normalized);

    if (was_added) this._added.next(normalized);

    return was_added;
  }

  delete(triple: PseudoTriple): boolean {
    const normalized = normalize_triple(triple);
    const was_deleted = this._store.delete(normalized);
    if (was_deleted) this._deleted.next(normalized);
    return was_deleted;
  }

  into(triples: Iterable<PseudoTriple>) {
    // This ain't a subclass anymore, so calling store.into doesn't call
    // overridden .add().
    //
    // return this._store.into(triples);
    //
    // Adapted from base implementation.  Apparently true if *all* are added.
    let none_skipped = true;
    for (const f of triples) none_skipped = this.add(f) && none_skipped;
    return none_skipped;
  }

  mint() {
    return this._bnode_space.mint();
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
