// Stashed naive version of triples-to-object.  It's actually pretty close to
// what JSON-LD does (and could easily be made closer), but I'm still sussing
// the balance between JSON-LD and RDF/JS terms for runtime usage.
import { Term } from "@def.codes/rdf-data-model";
import * as tx from "@thi.ng/transducers";

type PseudoTriple = [Term, Term, Term];

// Map the raw triples for a subject into a multi-valued JS object.

// Assume all values are potentially multiple, hence wrapped in array.  We
// *could* skip this for (OWL) functional properties, though that would
// require a lot of lookup.

// But.... does it matter that something *might* have multiple values, if it
// *doesn't* have multiple values right now?  The way to deal with the
// ambiguity of arrays versus lists is to use the `@list` keyword.

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
