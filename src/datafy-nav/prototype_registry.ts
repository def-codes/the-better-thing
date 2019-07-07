// prototype registry
// helper for use with defmulti

// rather not depend on this, but
import { subscription } from "@thi.ng/rstream";

export const NULL = Symbol("null");
export const UNDEFINED = Symbol("undefined");

function make_prototype_registry() {
  const prototypes = new Map<symbol, any>();
  const keys = new Map<any, symbol>();
  const registered = subscription();
  const ensure = (prototype: any) => {
    if (keys.has(prototype)) return keys.get(prototype);

    if (prototype) {
      const sym = Symbol(prototype.constructor.name);
      keys.set(prototype, sym);
      prototypes.set(sym, prototype);
      const next = Object.getPrototypeOf(prototype);
      // Or can you make an `isa` that's shared across dispatchers?
      registered.next([sym, ensure(next)]);
      return sym;
    }
  };
  return Object.assign(ensure, { registered });
}

function make_prototype_registry_0() {
  const state = { by_prototype: new Map(), by_symbol: new Map() };
  const ensure = (prototype: any) => {
    if (state.by_prototype.has(prototype))
      return state.by_prototype.get(prototype);

    if (prototype) {
      const sym = Symbol(prototype.constructor.name);
      state.by_prototype.set(prototype, sym);
      state.by_symbol.set(sym, prototype);
      const next = Object.getPrototypeOf(prototype);
      // um...
      if (next) datafy_protocol.isa(sym, ensure(next));
      return sym;
    }
  };
  return Object.assign(ensure, { state });
}

export const register_prototype = make_prototype_registry();

export const by_type = x => {
  if (x === null) return NULL;
  if (x === undefined) return UNDEFINED;
  const proto = Object.getPrototypeOf(x);
  return register_prototype(proto) || typeof x;
};
