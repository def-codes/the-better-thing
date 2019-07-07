// Define mechanism for defining type-based multimethods
import { Polymethod } from "./api";
import { defmulti } from "@thi.ng/defmulti";
import { get_type_id } from "./get-type";
import { register_prototype } from "./prototype-registry";
import { polymethod_registry } from "./polymethod-registry";

export const polymethod = <T = any, A extends any[] = any[]>(): Polymethod<
  T,
  A
> => {
  // note defmulti does not use variadic args.  should fix upstream
  const multimethod = defmulti((first: A[0] /*, ...rest: any[]*/) => {
    const type = get_type_id(first);

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
      return undefined;
    }

    return type;
  });

  // All multimethods are registered.
  polymethod_registry.add(multimethod);

  return Object.assign(multimethod, {
    extend(thing: string | Function, fn) {
      // IRI
      if (typeof thing === "string") multimethod.add(thing, fn);
      // Constructor
      else {
        // If the value doesn't have a prototype, then we assume that it *is*
        // the prototype.??
        multimethod.add(register_prototype(thing.prototype || thing), fn);
      }
    }
  });
};
