import { Term, Variable } from "@def.codes/rdf-data-model";
import { TripleStore } from "@thi.ng/rstream-query";
import { PseudoTriples } from "./api";
import { sync_query } from "./query-helpers";
import { factory as rdf } from "./factory";

// ALL THE FOLLOWING FROM meld-core/system

const is_variable = (trm: Term): trm is Variable => trm.termType === "Variable";

const has_open_variables = (triples: PseudoTriples) =>
  triples.some(triple => triple.some(is_variable));

const mint_blank = () => rdf.blankNode();

/** Replace variables with new blank nodes in the given triples. */
export const sub_blank_nodes = (triples: PseudoTriples) => {
  const map = new Map();
  // Covers predicate for good measure but only expecting vars in s & o pos's.
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
export const expand = (store: TripleStore, triples: PseudoTriples) => {
  if (has_open_variables(triples)) {
    const existing = sync_query(store, triples);
    if (!existing || existing.size === 0) return sub_blank_nodes(triples);
  } else return triples;
};
