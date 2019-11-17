import { Handler } from "../api";
import { STATUS } from "../constants";

interface Options {
  handler: Handler;
  debug?: boolean;
}
const DEFAULT: Partial<Options> = {
  debug: true,
};

/** Wrap a given handler with an error trap. */
export const with_error_boundary = (options: Options): Handler => request => {
  const { handler, debug }: Options = { ...DEFAULT, ...options };
  try {
    return handler(request);
  } catch (error) {
    console.log(error);
    return {
      ...STATUS.INTERNAL_SERVER_ERROR,
      ...(!debug ? {} : { content: error.toString() }),
    };
  }
};
