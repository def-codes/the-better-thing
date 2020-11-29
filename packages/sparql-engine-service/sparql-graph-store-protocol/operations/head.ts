// Handle SPARQL Graph Store HTTP HEAD requests

import { STATUS } from "@def.codes/simple-http-server";
import type { Request, Response } from "@def.codes/simple-http-server";
import type { DatasetContext } from "../../api";

export const handle_head = async (
  request: Request,
  context: DatasetContext
): Promise<Response> => {
  return STATUS.NOT_IMPLEMENTED;
};
