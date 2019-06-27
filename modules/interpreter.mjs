import rdf from "./rdf.mjs";
import { as_turtle } from "./turtle.mjs";

// Hack for browser/node support
import * as tx1 from "../node_modules/@thi.ng/transducers/lib/index.umd.js";
const tx = Object.keys(tx1).length ? tx1 : thi.ng.transducers;

// We're not actually changing to RDF triples as such...
// just using RDF terms with rstream-query-style tuples
const trip = (s, p, o) => [
  typeof s === "string" ? rdf.namedNode(s) : s,
  typeof p === "string" ? rdf.namedNode(p) : p,
  !o || !o.termType ? rdf.literal(o) : o
];

// ================================= WORLD / INTERPRETER

export const interpret = statements => {
  // Would be mapcat assuming
  return tx.transduce(
    tx.comp(tx.map(as_turtle), tx.keep()),
    tx.push(),
    statements
  );
};
