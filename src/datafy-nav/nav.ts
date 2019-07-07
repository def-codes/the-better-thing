import { defmulti } from "@thi.ng/defmulti";
import { by_type } from "./prototype_registry";

export const nav_protocol = defmulti(by_type);

export const nav = (coll, k, v) => {
  // Now what?
  const result = nav_protocol(coll, k, v);
  return result;
};
