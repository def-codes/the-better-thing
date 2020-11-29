// Handle SPARQL Graph Store HTTP GET requests

import { STATUS } from "@def.codes/simple-http-server";
import type { Request, Response } from "@def.codes/simple-http-server";
import type { Graph } from "sparql-engine";
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
  const { dataset, plan_builder } = context;

  const target_graph = read_graph_identifier(request)?.graph;
  if (!target_graph) return STATUS.BAD_REQUEST;

  let graph: Graph;
  if (target_graph === "default") {
    graph = dataset.getDefaultGraph();
  } else {
    /**
     * > If the RDF graph content identified in the request does not exist in
     * > the server, and the operation requires that it does, a `404 Not Found`
     * > response code MUST be provided in the response.
     */
    if (!dataset.hasNamedGraph(target_graph.iri)) {
      return STATUS.NOT_FOUND;
    }
    graph = dataset.getNamedGraph(target_graph.iri);
  }

  const turtle = await graph_to_turtle(graph, plan_builder);

  return {
    ...STATUS.OK,
    headers: {
      "Content-type": "text/turtle",
    },
    body: turtle,
  };
};
