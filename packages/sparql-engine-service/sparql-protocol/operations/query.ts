// Handle SPARQL Protocol query requests

import type { Request, Response } from "@def.codes/simple-http-server";
import { STATUS } from "@def.codes/simple-http-server";
import * as querystring from "querystring";
import type { Bindings, PipelineStage } from "sparql-engine";
import { rdf } from "sparql-engine";
import type { DatasetContext } from "../../api";
import type { RDFTerm, SparqlSelectResults } from "../sparql-json-results";

const { fromN3 } = rdf;

/**
 * 2.1 query operation
 *
 * > The `query` operation is used to send a SPARQL query to a service and
 * > receive the results of the query.
 *
 * https://www.w3.org/TR/2013/REC-sparql11-protocol-20130321/#query-operation
 */
export const handle_query = async (
  request: Request,
  context: DatasetContext
): Promise<Response> => {
  const { plan_builder } = context;

  /**
   * > The query operation *MUST* be invoked with either the HTTP GET or HTTP
   * > POST method.
   */
  const method = request.method.toUpperCase();
  if (!(method === "GET" || method === "POST")) {
    return STATUS.METHOD_NOT_ALLOWED;
  }

  // ASSUME for the moment query via url-encoded post
  const form = querystring.decode(request.body);
  const query = form["query"];

  /**
   * > Client requests for this operation *must* include exactly one SPARQL
   * > query string (parameter name: `query`)
   */
  if (!query || typeof query !== "string") {
    return STATUS.BAD_REQUEST;
  }

  // TODO: assuming a select query for the moment
  // as opposed to an ASK, CONSTRUCT, or DESCRIBE
  let iterator: PipelineStage<Bindings>;
  try {
    // TS: It's a Consumable for queries (else Consumable)
    iterator = plan_builder.build(query) as PipelineStage<Bindings>;
  } catch (error) {
    // TODO: malformed query should be 400, but other errors may be 500.  Can we
    // tell the difference here, or do we need to do a separate parsing step?
    // See also update.ts
    return STATUS.BAD_REQUEST;
  }

  const bindings: Record<string, RDFTerm>[] = [];
  let vars: SparqlSelectResults["head"]["vars"];

  return new Promise<Response>((resolve, reject) => {
    iterator.subscribe(
      binding => {
        const dict = binding.toObject();

        // Set the variable names when we get a result.
        // TODO: need a way to know this a priori.  Should be set even when no results
        if (vars === undefined) {
          vars = Object.keys(dict).map(key => {
            if (!key.startsWith("?")) {
              console.log(`assert fail: unexpected variable name: ${key}`);
            }
            return key.slice(1);
          });
        }

        const result = {};
        for (const [key, value] of Object.entries(dict)) {
          result[key.slice(1)] = fromN3(value);
        }
        bindings.push(result);
      },
      reject,
      () => {
        const results: SparqlSelectResults = {
          head: { vars },
          results: { bindings },
        };

        /**
         * > The response body of a successful query operation with a 2XX
         * > response is either:
         *
         * > - a SPARQL Results Document in XML, JSON, or CSV/TSV format (for
         * >   SPARQL Query forms SELECT and ASK); or,
         *
         * > - an RDF graph [RDF-CONCEPTS] serialized, for example, in the
         * >   RDF/XML syntax [RDF-XML], or an equivalent RDF graph
         * >   serialization, for SPARQL Query forms DESCRIBE and CONSTRUCT).
         */
        resolve({
          ...STATUS.OK,
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(results),
        });
      }
    );
  });
};
