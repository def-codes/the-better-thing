import rdf from "@def.codes/rdf-data-model";
import { expecting_statement } from "./turtle-expand";

const { namedNode, variable, literal } = rdf;

const as_term = value => {
  if (value.term) {
    if (typeof value.term === "string") return namedNode(value.term);
    // To mint blank nodes in place of the variables, see `sub_blank_nodes`.
    if ("minted" in value.term) return variable(`v${value.term.minted}`);
    throw `Invalid term ${JSON.stringify(value)}`;
  }
  // If a literal is already an RDF-term, then take it as-is.  This is intended
  // to support “kernel space” code that mixes existing terms with scanned
  // expressions.  Technically, userspace code could emit an object with a
  // termType property without intending this interpretation, so this is not an
  // airtight check.
  if (value.literal)
    return typeof value.literal.termType === "string"
      ? value.literal
      : // TODO: no
        literal(value.literal);

  throw `Cannot convert to term: ${value}`;
};

const rdfify_terms = spo => spo.map(as_term);

// Expression here is a single statement from expression scanner.
export const as_triples = expression => {
  if (expression) {
    try {
      return Array.from(expecting_statement(expression), rdfify_terms);
    } catch (error) {
      console.log("ERROR: ", error);
      throw error;
    }
  }
};
