import { nav_polymethod } from "./internal/polymethods";

export const nav = (coll, k, v) => {
  // Now what?  Clojure just does this... nothing else.  The default
  // implementation (for Object and null) is to return `v`.
  const result = nav_polymethod(coll, k, v);
  return result;
};
