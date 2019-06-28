import rdf from "./rdf.mjs";
import { expecting_statement } from "./turtle-expand.mjs";

const { namedNode: n, variable: v, literal: l, blankNode: b } = rdf;

const as_term = value => {
  if (value.term) {
    if (typeof value.term === "string") return n(value.term);
    // Could also be blank nodes.
    if (value.term.minted) return v(`v${value.term.minted}`);
    throw `Invalid term ${value}`;
  }
  if (value.literal) return l(value.literal);

  throw `Cannot convert to term: ${value}`;
};

const rdfify_terms = spo => spo.map(as_term);

// Expression here is a single statement from expression scanner.
export const as_turtle = expression => {
  if (expression) {
    try {
      return Array.from(expecting_statement(expression), rdfify_terms);
    } catch (error) {
      console.log("ERROR: ", error);
      throw error;
    }
  }
};
