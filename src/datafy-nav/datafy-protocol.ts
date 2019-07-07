// The public-facing protocol, which only provides extension.  Invocation must
// go through the `datafy` function, which see.  The protocol is not invokable
// as such.
import { datafy_polymethod } from "./internal/datafy-polymethod";

/** Singleton extension point for datafy protocol. */
export const datafy_protocol = {
  extend: datafy_polymethod.extend
};
