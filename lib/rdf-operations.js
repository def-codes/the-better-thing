const tx = require("@thi.ng/transducers");

const is_named_node = term => term.termType === "NamedNode";
const is_blank_node = term => term.termType === "BlankNode";
const is_literal = term => term.termType === "Literal";

const is_ground_term = term => is_named_node(term) || is_literal(term);
const is_ground_triple = triple => triple.every(is_ground_term);

const terms_in = store =>
  tx.concat(store.indexS.keys(), store.indexP.keys(), store.indexO.keys());

const bnodes_in = store =>
  tx.iterator(
    tx.filter(is_blank_node),
    // tx.concat(store.indexS.keys(), store.indexO.keys())
    tx.concat(store.nodes())
  );

const literals_in = store =>
  tx.iterator(tx.filter(is_literal), store.indexO.keys());

module.exports = {
  is_blank_node,
  is_ground_triple,
  bnodes_in,
  literals_in,
  terms_in,
};
