// THIS STUFF is all in rstream-query-rdf.  moved here to work on it
const { transduce, mapcat, conj } = require("@thi.ng/transducers");
// import { Term, Variable } from "@def.codes/rdf-data-model";
// import { TripleStore } from "@thi.ng/rstream-query";
// import { PseudoTriple, PseudoTriples, PseudoRule } from "./api";

const {
  sync_query,
  RDFTripleStore,
  factory: rdf,
} = require("@def.codes/rstream-query-rdf");

// ALL THE FOLLOWING FROM meld-core/system

// const is_variable = (trm: Term): trm is Variable => trm.termType === "Variable";
const is_variable = trm => trm.termType === "Variable";

// const has_open_variables = (triples: PseudoTriples) =>
//   triples.some(triple => triple.some(is_variable));
const has_open_variables = triples =>
  triples.some(triple => triple.some(is_variable));

const mint_blank = () => rdf.blankNode();

/** Replace variables with new blank nodes in the given triples. */
// need an equivalent version that checks for blank nodes instead of vars
// export const sub_blank_nodes = (triples: PseudoTriples): PseudoTriples => {
const sub_blank_nodes = triples => {
  // const map = new Map<string, Term>();
  const map = new Map();
  // @ts-ignore: https://github.com/microsoft/TypeScript/issues/29841
  return triples.map(triple =>
    triple.map(term => {
      if (!is_variable(term)) return term;
      if (!map.has(term.value)) map.set(term.value, mint_blank());
      return map.get(term.value);
    })
  );
};

// When the asserted triples contain open variables (i.e. any variable terms),
// this treats them as a “there exists” assertion.
// export const expand = (store: TripleStore, triples: PseudoTriples) => {
const expand = (store, triples) => {
  if (has_open_variables(triples)) {
    const existing = sync_query(store, triples);
    if (!existing || existing.size === 0) return sub_blank_nodes(triples);
  } else return triples;
};

// ground?
// const construct = (triples: PseudoTriples): PseudoTriples =>
//   has_open_variables(triples) ? sub_blank_nodes(triples) : triples;
const construct = triples =>
  has_open_variables(triples) ? sub_blank_nodes(triples) : triples;

// compute the results (assertions) of the given rule on the given store
// assumes all rule conclusions use assert
// const interpret_rule = (store: RDFTripleStore) => ({ when, then }) =>
const interpret_rule = store => ({ when, then }) =>
  transduce(
    mapcat(_ => construct(then(_).assert)),
    conj(),
    sync_query(store, when) || []
  );

// compute the results (assertions) of the given rules on the given store
// export const interpret_rules = (
//   store: RDFTripleStore,
//   rules: readonly PseudoRule[]
// ) => transduce(mapcat(interpret_rule(store)), conj(), rules);

const interpret_rules = (store, rules) =>
  transduce(mapcat(interpret_rule(store)), conj(), rules);

module.exports = { interpret_rules };
