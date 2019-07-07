// Stateful and side-effecting function for getting the type of a value based on
// the current type registry.  Querying a type also ensures that it and any
// ancestors are registered.

export const NULL = Symbol("null");
export const UNDEFINED = Symbol("undefined");

// Get a single, distinct value representing an object's type.
/*
  Rules:
  if a value has a "@type" property with a string value, use that.
  if a value has a "@type" property with multiple string values...
  this is dealt with in the dispatcher
  Otherwise, look for a prototype
*/
import { register_prototype } from "./prototype-registry";

export const get_type_id = (x): symbol | string | string[] => {
  // For these to be usable, you'd have to export them.
  // could also use Symbol.for("rdf:nil") (expanded)
  if (x === null) return NULL;
  // Extending to undefined is nonsense anyway
  if (x === undefined) return UNDEFINED;

  const rdf_type = x["@type"];
  if (
    typeof rdf_type === "string" ||
    (Array.isArray(rdf_type) &&
      // There's a cost to this check...
      rdf_type.every(type => typeof type === "string"))
  )
    return rdf_type;

  const proto = Object.getPrototypeOf(x);
  if (proto) return register_prototype(proto);

  // This would only happen for objects with null prototype, e.g. from
  // Object.create(null).
  return undefined;
};
