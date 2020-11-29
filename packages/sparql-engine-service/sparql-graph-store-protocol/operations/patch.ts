// Handle SPARQL Graph Store HTTP PATCH

import { STATUS } from "@def.codes/simple-http-server";
import type { Request, Response } from "@def.codes/simple-http-server";
import type { DatasetContext } from "../../api";

export const handle_patch = async (
  request: Request,
  context: DatasetContext
): Promise<Response> => {
  return STATUS.NOT_IMPLEMENTED;
};
