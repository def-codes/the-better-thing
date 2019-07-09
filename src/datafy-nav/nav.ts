import { nav_polymethod } from "./internal/polymethods";

// TEMP
const NAV = Symbol.for("nav");

export const nav = (coll, k, v) => {
  // Now what?  Clojure just does this... nothing else.  The default
  // implementation (for Object and null) is to return `v`.

  // TEMP: mimic protocol extension via metadata.
  if (coll && coll[NAV]) return coll[NAV](coll, k, v);
  // I don't think this makes sense.
  // if (v && v[NAV]) return v[NAV](coll, k, v);

  const result = nav_polymethod(coll, k, v);
  return result;
};
