import { defmulti, DEFAULT } from "@thi.ng/defmulti";
import { register_prototype, by_type } from "./prototype_registry";

const datafy_protocol = defmulti(by_type);

// const DATAFY_OBJ = Symbol("datafy/obj");

const identity = <T>(x: T): T => x;

register_prototype.registered.subscribe({
  next([sym, parent]) {
    datafy_protocol.isa(sym, parent);
  },
});

datafy_protocol.add(DEFAULT, identity);

export const datafy = (x: any) => {
  const result = datafy_protocol(x);
  if (result === x) return x;
  //if (result != null && typeof x === "object") result[DATAFY_OBJ] = x;
  return result;
};

export const extend_datafy = (classy: { prototype: any }, handler) =>
  datafy_protocol.add(register_prototype(classy.prototype), handler);
