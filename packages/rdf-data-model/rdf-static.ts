import * as RDF from "./api";

export const term_id = (term: RDF.Term): string => {
  if (term.termType === "NamedNode") return term.value;
  if (term.termType === "BlankNode") return `_:${term.value}`;
  if (term.termType === "Variable") return `?${term.value}`;
  if (term.termType === "DefaultGraph") return `<default graph>`;
  if (term.termType === "Literal")
    term.language
      ? `"${term.value}"@${term.language}`
      : term.datatype.value === RDF.STRING_TYPE_IRI
      ? `"${term.value}"`
      : `"${term.value}"^^${term.datatype.value}`;
};

export const equal_terms = (a: RDF.Term, b: RDF.Term) => {
  if (!a || !b || !a.termType || a.termType !== b.termType) return false;

  if (a.termType === "Literal")
    return (
      a.value === b.value &&
      a.language === (<RDF.Literal>b).language &&
      equal_terms(a.datatype, (<RDF.Literal>b).datatype)
    );

  return a.value === b.value;
};
