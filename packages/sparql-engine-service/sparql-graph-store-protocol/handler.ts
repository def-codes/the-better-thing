import type { DatasetContext } from "../api";
import type { Handler } from "@def.codes/simple-http-server";
import { STATUS } from "@def.codes/simple-http-server";
import { handle_get as GET } from "./operations/get";
import { handle_put as PUT } from "./operations/put";
import { handle_delete as DELETE } from "./operations/delete";
import { handle_post as POST } from "./operations/post";
import { handle_head as HEAD } from "./operations/head";
import { handle_patch as PATCH } from "./operations/patch";

const HANDLERS = { GET, PUT, DELETE, POST, HEAD, PATCH };

export const graph_store_protocol = (context: DatasetContext): Handler => {
  return async request => {
    const method = request.method.toUpperCase();
    const handler = HANDLERS[method];

    /**
     * From § “5.1 Status Codes”
     *
     * > A request using an unsupported HTTP verb in conjunction with a
     * > malformed or unsupported request syntax MUST receive a response with a
     * > 405 Method Not Allowed.
     *
     * https://www.w3.org/TR/sparql11-http-rdf-update/#status-codes
     */
    if (!handler) {
      return STATUS.METHOD_NOT_ALLOWED;
    }

    return handler(request, context);
  };
};
