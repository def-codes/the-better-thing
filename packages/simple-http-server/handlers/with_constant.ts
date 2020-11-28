import { Handler, Response } from "../api";
import { STATUS } from "../constants";

interface Options {
  /** The fixed response to always use for this request. */
  response: Partial<Response>;
}

const DEFAULT_STATUS = STATUS.OK;
const DEFAULT_HEADERS = {
  "Content-type": "text/plain",
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};
{
}
export const with_constant = (options: Options): Handler => _request => {
  const { response } = options;
  const { headers, ...rest } = response;
  return {
    ...DEFAULT_STATUS,
    headers: { ...DEFAULT_HEADERS, ...headers },
    ...rest,
  };
};
