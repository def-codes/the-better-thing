// PROVISIONAL
import type { Request } from "@def.codes/simple-http-server";
import type { SparqlQueryOperation } from "./sparql-protocol";

// But this could need to return an HTTP response
export const request_to_operation = (
  request: Request
): SparqlQueryOperation => {
  const default_graph_uri = "";
  const named_graph_uri = "";
  return { query: request.body, default_graph_uri, named_graph_uri };
};
