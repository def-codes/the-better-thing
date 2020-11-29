import type { DatasetContext } from "../api";
import type { Handler } from "@def.codes/simple-http-server";
import { handle_query } from "./operations/query";
import { handle_update } from "./operations/update";
import * as querystring from "querystring";

export const sparql_protocol = (context: DatasetContext): Handler => {
  return async request => {
    const { body } = request;
    const { query, update } = querystring.decode(body);
    if (update) return handle_update(request, context);
    if (query) return handle_query(request, context);
  };
};
