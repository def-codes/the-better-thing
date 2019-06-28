import rdf from "./rdf.mjs";
import { as_turtle } from "./turtle.mjs";

// Hack for browser/node support
import * as tx1 from "../node_modules/@thi.ng/transducers/lib/index.umd.js";
const tx = Object.keys(tx1).length ? tx1 : thi.ng.transducers;

/** Replace variables with new blank nodes in the given triples. */
// Using rstream-style (array) triples with RDF.js terms.
const sub_blank_nodes = triples => {
  const map = new Map();
  const sub = term => {
    if (term.termType === "Variable") {
      if (!map.has(term.value)) map.set(term.value, rdf.blankNode());
      return map.get(term.value);
    }
    return term;
  };
  // Covers predicate for good measure but only expecting vars in s & o pos's.
  return triples.map(triple => triple.map(sub));
};

// ================================= WORLD / INTERPRETER

const identity = x => x;

export const interpret = statements => {
  return tx.transduce(
    tx.comp(
      tx.map(as_turtle),
      tx.keep(),
      tx.map(sub_blank_nodes),
      tx.mapcat(identity)
    ),
    tx.push(),
    statements
  );
};
