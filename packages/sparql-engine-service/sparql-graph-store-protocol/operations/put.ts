// Handle SPARQL Graph Store HTTP PUT

import { STATUS } from "@def.codes/simple-http-server";
import type { Request, Response } from "@def.codes/simple-http-server";
import { Parser } from "n3";
import type { DatasetContext } from "../../api";
import { read_graph_identifier } from "../graph-identification";

/**
 * 5.3 HTTP PUT
 *
 * > A request that uses the HTTP **PUT** method MUST store the enclosed RDF
 * > payload as RDF graph content.
 *
 * https://www.w3.org/TR/sparql11-http-rdf-update/#http-put
 */
export const handle_put = async (
  request: Request,
  context: DatasetContext
): Promise<Response> => {
  const { dataset } = context;

  const target_graph = read_graph_identifier(request)?.graph;
  if (!target_graph) return STATUS.BAD_REQUEST;

  // ASSUME that the input is Turtle
  // TODO: content type negotiate, or at least check header
  const parser = new Parser();

  let quad_iterator;
  try {
    quad_iterator = parser.parse(request.body);
  } catch (error) {
    return {
      ...STATUS.BAD_REQUEST,
      body: `Failed to parse input: ${error.message}`,
    };
  }

  // Don't delete anything until parsing succeeds.

  if (target_graph === "default") {
    // Clear the default graph?  hmm
  } else {
    // Drop the indicated graph silently
    if (dataset.hasNamedGraph(target_graph.iri)) {
      dataset.deleteNamedGraph(target_graph.iri);
    }
  }

  // TODO: “If new RDF graph content is created, the origin server MUST inform
  // the user agent via the `201 Created` response.”

  const graph =
    target_graph === "default"
      ? dataset.getDefaultGraph()
      : // ASSUME a graph factory was set
        dataset.createGraph(target_graph.iri);

  for (const quad of quad_iterator) {
    const subject = quad.subject.id;
    const predicate = quad.predicate.id;
    const object = quad.object.id;
    console.log(
      `INSERTING subject, predicate, object`,
      subject,
      predicate,
      object
    );

    await graph.insert({ subject, predicate, object });
  }
  return STATUS.OK;
};
