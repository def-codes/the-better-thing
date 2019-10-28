/** An HTTP handler that supports sub-handlers mapped to specific paths. */

// Why not just make the matching a general function?  Instead of hard-basing it
// on path?  Because path is in fact treated specially, in that the handler sees
// a path value relative to the mounted path.  As such, handlers are not aware
// of any other context.
import { Handler } from "./api";
import { STATUS } from "./constants";

type HandlerMapping = { path: string; handler: Handler };

interface Options {
  mappings: HandlerMapping[];
}

const SLASHES = /^\/+|\/+$/;

const trim_slashes = (s: string) => s.replace(SLASHES, "");
const trim_prefix = (a: string, prefix: string) =>
  a.startsWith(prefix) ? a.substring(prefix.length) : a;

export const with_path_mount = ({ mappings }: Options): Handler => request => {
  // A blank path matches everything.
  const mapping = mappings.find(
    ({ path }) => !path || request.path.startsWith(path)
  );

  if (!mapping) return STATUS.NOT_FOUND;

  return mapping.handler({
    ...request,
    path: trim_slashes(trim_prefix(request.path, mapping.path)),
  });
};
