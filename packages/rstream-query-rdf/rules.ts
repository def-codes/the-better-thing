// THIS STUFF is temporarily in lib
import { transduce, mapcat, conj } from "@thi.ng/transducers";
import { Term, Variable } from "@def.codes/rdf-data-model";
import { TripleStore } from "@thi.ng/rstream-query";
import { PseudoTriple, PseudoTriples, PseudoRule } from "./api";
import { sync_query } from "./query-helpers";
import { factory as rdf } from "./factory";
import { RDFTripleStore } from "./rdf-triple-store";

// ALL THE FOLLOWING FROM meld-core/system

const is_variable = (trm: Term): trm is Variable => trm.termType === "Variable";

const has_open_variables = (triples: PseudoTriples) =>
  triples.some(triple => triple.some(is_variable));

const mint_blank = () => rdf.blankNode();

/** Replace variables with new blank nodes in the given triples. */
// need an equivalent version that checks for blank nodes instead of vars
export const sub_blank_nodes = (triples: PseudoTriples): PseudoTriples => {
  const map = new Map<string, Term>();
  return triples.map(triple =>
    triple.map(term => {
      if (!is_variable(term)) return term;
      if (!map.has(term.value)) map.set(term.value, mint_blank());
      return map.get(term.value);
    })
  );
};

// ground?
const construct = (triples: PseudoTriples): PseudoTriples =>
  has_open_variables(triples) ? sub_blank_nodes(triples) : triples;

// compute the results (assertions) of the given rule on the given store
// assumes all rule conclusions use assert
const interpret_rule = (store: RDFTripleStore) => ({ when, then }) =>
  transduce(
    mapcat(_ => construct(then(_).assert)),
    conj(),
    sync_query(store, when) || []
  );

// compute the results (assertions) of the given rules on the given store
export const interpret_rules = (
  store: RDFTripleStore,
  rules: readonly PseudoRule[]
) => transduce(mapcat(interpret_rule(store)), conj(), rules);
