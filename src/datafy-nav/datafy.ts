import { Datafied, DATAFY_METADATA, ORIGINAL } from "./api";
import { datafy_polymethod } from "./internal/polymethods";

export const datafy = <T>(thing: T): Datafied<T> => {
  const datafied = datafy_polymethod(thing);

  // As per Clojure's implementation, if the datafied result is identical to the
  // original, return it.
  if (datafied === thing) return thing;

  // If the result supports metadata, annotate the result.
  // TODO: there's no point in this nesting, right?
  // you assume the returned value doesn't have metadata?
  // if not, this clobbers it anyway
  if (datafied != null && typeof datafied === "object")
    return Object.assign(datafied, {
      [DATAFY_METADATA]: { [ORIGINAL]: thing }
    });

  return datafied;
};
