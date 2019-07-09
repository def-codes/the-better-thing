// Implement datafy/nav for `TripleStore` class from `@thi.ng/rstream-query`
// Assumes that the triples are using RDF/JS terms with reference identity.
// This is quasi-RDF/JS in that rstream-query does not (and may never) implement
// the recommended interfaces for Datastore, etc.
import { datafy_protocol, nav_protocol } from "@def.codes/datafy-nav";
import { TripleStore } from "@thi.ng/rstream-query";
import * as tx from "@thi.ng/transducers";
import rdf from "@def.codes/rdf-data-model";
import { Term } from "@def.codes/rdf-data-model";
import { triples_to_object } from "./json-ld-helpers";

type PseudoTriple = [Term, Term, Term];

const NAV = Symbol.for("nav");

const naive_datafy_resource = (subject_facts: PseudoTriple[]) =>
  tx.reduce(
    tx.groupByObj({
      key: ([, p]) => p,
      group: tx.reducer(
        () => undefined,
        (acc, [, , o]) => (acc === undefined ? [o] : [...acc, o])
      )
    }),
    subject_facts
  );
// Map the raw triples for a subject into a multi-valued JS object.

// Assume all values are potentially multiple, hence wrapped in array.  We
// *could* skip this for (OWL) functional properties, though that would
// require a lot of lookup.

// But.... does it matter that something *might* have multiple values, if it
// *doesn't* have multiple values right now?  The way to deal with the
// ambiguity of arrays versus lists is to use the `@list` keyword.  In other
// words,

const subject_to_object = (store: TripleStore, subject: Term) => {
  const subject_indices = store.indexS.get(subject);
  const subject_triples = [
    ...tx.map(index => store.triples[index], subject_indices)
  ];
  return triples_to_object(subject_triples);
};

// Unconditionally treats `value` as a term identifying a subject in the store.
const navize_store = (store: TripleStore) => (
  _store: any,
  _key: any,
  value: unknown
) => {};

export const extend_TripleStore = {
  datafy() {
    datafy_protocol.extend(TripleStore, store => {
      // navize this to retain store in context.
      return {
        [NAV]: navize_store(store),
        "@type": "@thi.ng/rstream-query/TripleStore",
        "collection:size": store.triples.length
      };
    });
  },
  nav() {
    nav_protocol.extend(TripleStore, navize_store);
  }
};

// TESTING
export const test = (store: TripleStore, id: string) => {
  return subject_to_object(store, rdf.namedNode(id));
};
