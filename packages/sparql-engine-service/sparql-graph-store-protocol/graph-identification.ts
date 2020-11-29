import type { Request } from "@def.codes/simple-http-server";
import * as URL from "url";

// Cheap test to tell whether a URL is absolute.
const is_absolute = (url: string): boolean => {
  const parsed = URL.parse(url);
  return parsed.protocol !== null;
};

/**
 * 4.2 Indirect Graph Identification
 *
 * > Any server that implements this protocol and receives a request IRI in this
 * > form MUST perform the indicated operation on the RDF graph content
 * > identified by the IRI embedded in the query component where the IRI is the
 * > result of percent-decoding the value associated with the _graph_ key.
 *
 * https://www.w3.org/TR/sparql11-http-rdf-update/#indirect-graph-identification
 */
export const read_graph_identifier = (
  request: Request
): { readonly graph: "default" | { readonly iri: string } } | undefined => {
  const { query } = request;

  /**
   * > In a similar manner, a query component comprised of the string _default_
   * > can be used to indicate that the operation indirectly identifies the
   * > default graph in the Graph Store.
   */
  if ("default" in query) {
    return { graph: "default" };
  }

  const iri = query["graph"];

  // A type other than string suggests it has multiple values, which would be a
  // bad request.
  if (!iri || typeof iri !== "string") {
    return undefined;
  }

  /**
   * > The query string IRI MUST be an absolute IRI and the server MUST respond
   * > with a `400 Bad Request` if it is not.
   */
  if (!is_absolute(iri)) {
    return undefined;
  }

  return { graph: { iri } };
};
