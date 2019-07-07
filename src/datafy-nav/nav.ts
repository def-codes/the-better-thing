import { defmulti } from "@thi.ng/defmulti";
import { polymethod } from "@def.codes/polymorphic-functions";

export const nav_protocol = polymethod();

export const nav = (coll, k, v) => {
  // Now what?
  const result = nav_protocol(coll, k, v);
  return result;
};
