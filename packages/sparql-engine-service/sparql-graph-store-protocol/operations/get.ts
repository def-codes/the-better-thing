// Handle SPARQL Graph Store HTTP GET requests

import { STATUS } from "@def.codes/simple-http-server";
import type { Request, Response } from "@def.codes/simple-http-server";
import type { DatasetContext } from "../../api";
import { graph_to_turtle } from "../../serialize-graph";
import { read_graph_identifier } from "../graph-identification";

/**
 * 5.2 HTTP GET
 *
 * > A request that uses the HTTP **GET** method MUST retrieve an RDF payload
 * > that is a serialization of the named graph paired with the graph IRI in the
 * > Graph Store.
 *
 * https://www.w3.org/TR/sparql11-http-rdf-update/#http-get
 */
export const handle_get = async (
  request: Request,
  context: DatasetContext
): Promise<Response> => {
  const { dataset } = context;

  const target = read_graph_identifier(request);
  if (!target?.graph) return STATUS.BAD_REQUEST;

  /**
   * > If the RDF graph content identified in the request does not exist in
   * > the server, and the operation requires that it does, a `404 Not Found`
   * > response code MUST be provided in the response.
   */
  if (target.graph !== "default" && !dataset.hasNamedGraph(target.graph.iri)) {
    return STATUS.NOT_FOUND;
  }

  const turtle = await graph_to_turtle(context, target);

  return {
    ...STATUS.OK,
    headers: {
      "Content-type": "text/turtle",
    },
    body: turtle,
  };
};
