// Operations for instantiating templates
const tx = require("@thi.ng/transducers");
const { is_blank_node } = require("./rdf-operations");
const { factory } = require("@def.codes/rstream-query-rdf");

const { blankNode, variable } = factory;

// could be any term but in practice key is Variable|BlankNode
const map_triple = (triple /*PseudoTriple*/, map /*:(t: Term) => Term>*/) =>
  triple.map(map);

const map_triples = (triples /*PseudoTriples*/, map /*:(t: Term) => Term>*/) =>
  // triples.map(triple => map_triple(triple, map));
  triples.map(triple => triple.map(map));

const variable_mappings = (record /*:Record<string,Term>*/) =>
  tx.map(([k, v]) => [variable(k), v], Object.entries(record));

const terms_in = triples => tx.mapcat(x => x, triples);
const bnodes_in = triples =>
  new Set(tx.filter(is_blank_node, terms_in(triples)));
const bnode_mappings = triples =>
  tx.map(_ => [_, blankNode()], bnodes_in(triples));

const substitute = map => term => map.get(term) || term;

/**
 * Resolve variables in a set of triples against a given value mapping.
 *
 * AND normalize any blank nodes in the template, which are scoped to template??
 */
const instantiate = (
  template /*:PseudoTriples*/,
  record /* Record<string, GroundTerm > */
) /*: PseudoTriples*/ => {
  const bnode = new Map(bnode_mappings(template));
  const vars = new Map(variable_mappings(record));
  console.log(`MAP`, { bnode, vars });

  return map_triples(
    map_triples(template, substitute(bnode)),
    substitute(vars)
  );

  const mapping = new Map([
    ...variable_mappings(record),
    ...bnode_mappings(template),
  ]);
  console.log(`mapping`, mapping);

  return map_triples(template, substitute(mapping));
};

// Just bind the variables, thanks
const bind = (
  template /*:PseudoTriples*/,
  record /* Record<string, GroundTerm > */
) /*: PseudoTriples*/ => {
  const mappings = variable_mappings(record);
  const variables = new Map(mappings);
  const ret = map_triples(template, substitute(variables));
  return ret;
};

module.exports = { instantiate, bind };
