// Deal with JavaScript bug.
export const is_object = (x): x is object =>
  x !== null && typeof x === "object";
