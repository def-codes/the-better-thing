import { alternatives } from "./regexp-helpers";
import { identity } from "mindgrub";

/** Utility for doing multiple lookup-based replaces in one pass. */
export const encoder = (
  dictionary,
  transform: ((s: string) => string) = identity
) => {
  const pattern = new RegExp(alternatives(Object.keys(dictionary)), "g");
  const replacer = match => transform(dictionary[match]);
  return text => text.replace(pattern, replacer);
};
