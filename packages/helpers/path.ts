import { PathGetter } from "./checked-path-types";
import { is_object } from "./is_object";

// This version of `path` uses conditional types with a multi-overload interface
// to get the inference that you would expect.

export const path: PathGetter = (value, ...keys) => {
  for (let key of keys) if (is_object(value)) value = value[key];
  return value;
};
