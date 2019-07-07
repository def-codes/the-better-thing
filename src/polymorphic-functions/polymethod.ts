// Define mechanism for defining type-based multimethods
import { Polymethod } from "./api";
import { defmulti } from "@thi.ng/defmulti";
import { get_type_id } from "./get-type";
import { register_prototype } from "./prototype-registry";
import { polymethod_registry } from "./polymethod-registry";

export const polymethod = <T, A extends any[]>(): Polymethod<T, A> => {
  // note defmulti does not use variadic args.  should fix upstream
  const multimethod = defmulti((first: A[0] /*, ...rest: any[]*/) => {
    const type = get_type_id(first);
    // If there are multiple (IRI) values for type, find which ones are
    // implemented.
    if (Array.isArray(type)) {
      const available = type.filter(id => multimethod.impls().has(id));
      // RDF resources will definitely have multiple types
      // How to decide which one to pick?
      if (available.length) return available[0];
      return undefined;
    }
    return type;
  });
  polymethod_registry.add(multimethod);

  return Object.assign(multimethod, {
    extend_by_prototype(thing, fn) {
      // Assume that thing is a constructor
      multimethod.add(register_prototype(thing.prototype), fn);
    },
    extend_by_iri(iri, fn) {
      multimethod.add(iri, fn);
    }
  });
};
