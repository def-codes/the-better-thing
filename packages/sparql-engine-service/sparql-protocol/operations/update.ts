// Handle SPARQL Protocol update requests

import { STATUS } from "@def.codes/simple-http-server";
import type { Request, Response } from "@def.codes/simple-http-server";
import * as querystring from "querystring";
import type { PlanBuilder } from "sparql-engine";
import { Consumable } from "sparql-engine/dist/operators/update/consumer";
import type { DatasetContext } from "../../api";

/**
 * 2.2 `update` operation
 *
 * > The `update` operation is used to send a SPARQL update request to a service.
 *
 * https://www.w3.org/TR/2013/REC-sparql11-protocol-20130321/#update-operation
 */
export const handle_update = async (
  request: Request,
  context: DatasetContext
): Promise<Response> => {
  const { plan_builder } = context;

  /**
   * > The update operation *must* be invoked using the HTTP POST method.
   */
  if (request.method.toUpperCase() !== "POST") {
    return STATUS.METHOD_NOT_ALLOWED;
  }

  // TODO: implement all methods.  Currently only supports 2.2.2 partially (no params)
  // 2.2.1 update via POST with URL-encoded parameters
  // 2.2.2 update via POST directly
  // 2.2.3 Specifying an RDF Dataset

  const form = querystring.decode(request.body);
  const update = form["update"];

  /**
   * > Client requests for this operation *must* include exactly one SPARQL
   * > update string (parameter name: `update`)
   */
  if (!update || typeof update !== "string") {
    return STATUS.BAD_REQUEST;
  }

  let command: ReturnType<PlanBuilder["build"]>;
  try {
    // TS: It's a Consumable for updates (else PipelineStage<any>)
    command = plan_builder.build(update) as Consumable;
  } catch (error) {
    // TODO: malformed query should be 400, but other errors may be 500.  Can we
    // tell the difference here, or do we need to do a separate parsing step?
    // See also query.ts
    return STATUS.BAD_REQUEST;
  }

  await command.execute();

  /**
   * 2.2.4 Success Responses
   *
   * > The response body of a successful update request is implementation
   * > defined. Implementations *may* use HTTP content negotiation to provide
   * > both human-readable and machine-processable information about the completed
   * > update request.
   *
   * https://www.w3.org/TR/2013/REC-sparql11-protocol-20130321/#update-success
   */
  return STATUS.OK;
};
