// Define mechanism for defining type-based multimethods
import { Polymethod } from "./api";
import { defmulti } from "@thi.ng/defmulti";
import { get_prototype_id, get_type_iri } from "./get-type";
import { register_prototype } from "./prototype-registry";
import { polymethod_registry } from "./polymethod-registry";

export const NULL = Symbol("null");
export const UNDEFINED = Symbol("undefined");

export const polymethod = <T = any, A extends any[] = any[]>(): Polymethod<
  T,
  A
> => {
  // Get a single, distinct value representing an object's type.
  /*
  Rules:
  check for null and undefined, which have special identifiers
  if a value has a "@type" property with a string value, use that.
  if a value has a "@type" property with multiple string values...
  this is dealt with in the dispatcher
  Otherwise, look for a prototype
*/

  // note defmulti does not use variadic args.  should fix upstream
  const multimethod = defmulti((first: A[0] /*, ...rest: any[]*/) => {
    if (first === null) return NULL;
    if (first === undefined) return UNDEFINED;

    let type: string | string[] | symbol = get_type_iri(first);

    // Multiple declared (IRI) types.
    if (Array.isArray(type)) {
      // DEBUG
      if (type.length > 1) console.log(`Multiple types!`, JSON.stringify(type));

      // Find which types have implementations.
      const available = type.filter(id => multimethod.impls().has(id));

      // RDF resources will definitely have multiple types
      // How to decide which one to pick?
      if (available.length > 1)
        console.log(`Multiple implementations!!`, JSON.stringify(available));

      if (available.length) return available[0];
    } else if (type) {
      // Ignore type IRI's if there are no implementations.
      if (!multimethod.impls().has(type)) type = null;
    }

    if (!type) type = get_prototype_id(first);

    return type;
  });

  // All multimethods are registered.
  polymethod_registry.add(multimethod);

  return Object.assign(multimethod, {
    extend(thing: null | string | Function, fn) {
      if (thing === null) multimethod.add(NULL, fn);
      // IRI
      else if (typeof thing === "string") multimethod.add(thing, fn);
      // Constructor
      else {
        // If the value doesn't have a prototype, then we assume that it *is*
        // the prototype.
        multimethod.add(register_prototype(thing.prototype || thing), fn);
      }
    },
  });
};
