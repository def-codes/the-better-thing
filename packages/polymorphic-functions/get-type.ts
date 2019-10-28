import { register_prototype } from "./prototype-registry";

export const get_type_iri = (thing: unknown) => {
  const rdf_type = thing["@type"];
  if (
    typeof rdf_type === "string" ||
    (Array.isArray(rdf_type) &&
      // There's a cost to this check...
      rdf_type.every(type => typeof type === "string"))
  )
    return rdf_type;
};

// Stateful and side-effecting function for getting the type of a value based on
// the current type registry.  Querying a prototype also ensures that it and any
// ancestors are registered.
export const get_prototype_id = (x): symbol | string | string[] => {
  const proto = Object.getPrototypeOf(x);
  if (proto) return register_prototype(proto);

  // This would only happen for objects with null prototype, e.g. from
  // Object.create(null).
  return undefined;
};
