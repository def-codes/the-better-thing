// Handle SPARQL Graph Store HTTP DELETE requests

import { STATUS } from "@def.codes/simple-http-server";
import type { Request, Response } from "@def.codes/simple-http-server";
import type { DatasetContext } from "../../api";
import { read_graph_identifier } from "../graph-identification";
import type { Consumable } from "sparql-engine/dist/operators/update/consumer";

/**
 * 5.4 HTTP DELETE
 *
 * > A request that uses the HTTP *DELETE* method SHOULD delete the RDF graph
 * > content identified by either the request or encoded IRI. This method MAY be
 * > overridden by human intervention (or other means) on the origin server.
 *
 * https://www.w3.org/TR/sparql11-http-rdf-update/#http-delete
 */
export const handle_delete = async (
  request: Request,
  context: DatasetContext
): Promise<Response> => {
  const { dataset } = context;

  const target_graph = read_graph_identifier(request)?.graph;
  if (!target_graph) return STATUS.BAD_REQUEST;

  if (target_graph === "default") {
    const default_graph = dataset.getDefaultGraph();

    // This is an assert fail.  There should always be a default graph.
    if (!default_graph) {
      return STATUS.NOT_FOUND;
    }

    /**
     * According to the Graph Store HTTP Protocol, calling `DELETE` on `default`
     * “is equivalent to `DROP DEFAULT`”
     *
     * According to [§ 3.2.2 of “SPARQL 1.1
     * Update”](https://www.w3.org/TR/sparql11-update/#drop)
     *
     * > `DROP DEFAULT` is equivalent to `CLEAR DEFAULT`.
     */
    // WARNING!  Deletes the default graph from a dataset without confirmation.
    const executor = context.plan_builder.build("CLEAR DEFAULT") as Consumable;
    await executor.execute();
  } else {
    /**
     * > If there is no such RDF graph content in the Graph Store, the server
     * > MUST respond with a `404 Not Found` response code.
     */
    if (!dataset.hasNamedGraph(target_graph.iri)) {
      return STATUS.NOT_FOUND;
    }

    dataset.deleteNamedGraph(target_graph.iri);
  }

  /**
   * > A response code of `200 OK` or `204 No Content` MUST be given in the
   * > response if the operation succeeded
   */
  return STATUS.OK;
};
