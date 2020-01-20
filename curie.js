const { DOT } = require("@def.codes/graphviz-format");

const PREFIXES = [["dot", DOT]];

const curie = iri => {
  for (const [prefix, start] of PREFIXES)
    if (iri.startsWith(start))
      return `${prefix}:${iri.substring(start.length)}`;
  if (iri === "rdf:type") return "a";
  return iri;
};

const curied_term = term =>
  term.termType === "NamedNode" ? curie(term.value) : term.toString();
const curied_triple = triple => triple.map(curied_term).join(" ");
const curied_triples = triples => triples.map(curied_triple);

module.exports = { curied_triples };
