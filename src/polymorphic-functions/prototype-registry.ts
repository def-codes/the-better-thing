// Internal, singleton registry for encountered prototypes.
import { register_relationship } from "./hierarchy-registry";

function make_prototype_registry() {
  const keys = new Map<object, symbol>();

  const ensure_registered = (prototype: object) => {
    if (!keys.has(prototype))
      keys.set(prototype, Symbol(prototype.constructor.name));
    return keys.get(prototype);
  };

  const ensure = (prototype: object) => {
    const child = ensure_registered(prototype);
    const parent = Object.getPrototypeOf(prototype);
    if (parent) register_relationship(child, ensure(parent));
    return child;
  };

  return (prototype: object) => ensure(prototype);
}

export const register_prototype = make_prototype_registry();
