// THIS STUFF is all in rstream-query-rdf.  moved here to work on it
// When the asserted triples contain open variables (i.e. any variable terms),
// this treats them as a “there exists” assertion.
const tx = require("@thi.ng/transducers");
// import { Term, Variable } from "@def.codes/rdf-data-model";
// import { TripleStore } from "@thi.ng/rstream-query";
// import { PseudoTriple, PseudoTriples, PseudoRule } from "./api";

const {
  sync_query,
  RDFTripleStore,
  factory: rdf,
} = require("@def.codes/rstream-query-rdf");
const { merge_graphs_simple } = require("./simple-merge");

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
// const map = new Map<string, Term>();
// @ts-ignore: https://github.com/microsoft/TypeScript/issues/29841
const sub_blank_nodes = (triples, map = Object.create(null)) =>
  triples.map(triple =>
    triple.map(term =>
      is_variable(term)
        ? map[term.value] || (map[term.value] = mint_blank())
        : term
    )
  );

// ground?
// const construct = (triples: PseudoTriples): PseudoTriples =>
//   has_open_variables(triples) ? sub_blank_nodes(triples) : triples;
const construct = (triples, defs) => {
  // console.log(`CONSTRUCT`, defs, triples);
  return has_open_variables(triples) ? sub_blank_nodes(triples, defs) : triples;
};

// compute the results (assertions) of the given rule on the given store
// assumes all rule conclusions use assert
// const interpret_rule = (store: RDFTripleStore) => ({ when, then }) =>
const interpret_rule = store => ({ when, then }) =>
  tx.map(_ => construct(then(_).assert, _), sync_query(store, when) || []);

// compute the results (assertions) of the given rules on the given store
// export const interpret_rules = (
//   store: RDFTripleStore,
//   rules: readonly PseudoRule[]
// ) => transduce(mapcat(interpret_rule(store)), conj(), rules);

// const interpret_rules = (store, rules) =>
//   new Set(mapcat(interpret_rule(store), rules));

const interpret_rules = (store, rules) => {
  const running = new RDFTripleStore();
  const interpret = interpret_rule(store);
  for (const rule of rules)
    for (const new_facts of interpret(rule))
      running.into(
        merge_graphs_simple(running, new RDFTripleStore(new_facts)).incoming
      );

  return running.triples;
};

module.exports = { interpret_rules };
