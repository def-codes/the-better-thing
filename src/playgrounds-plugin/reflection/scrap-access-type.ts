type CollectionType = "object" | "array" | "set" | "map" | "iterable";

type AccessType = "atomic" | CollectionType;

/** Return an object's collection type (or "atomic") based on complexity
 * class. */
const access_type = (value: any): AccessType => {
  if (value !== null && typeof value === "object") {
    if (Array.isArray(value)) return "array";
    // Technically only object keys are allowed on `WeakMap`.
    if (value instanceof Map || value instanceof WeakMap) return "map";
    if (value instanceof Set || value instanceof WeakSet) return "set";
    if (Symbol.iterator in value) return "iterable";
    // Special case for Date. Will have to revisit this.
    if (!(value instanceof Date)) return "object";
  }
  return "atomic";
};

//const ACCESS_TYPE_TESTS: [AccessType, any][] = [
const ACCESS_TYPE_TESTS = [
  ["set", new Set()],
  ["array", []],
  ["object", {}],
  ["object", { a: "foo" }],
  ["object", Object.create(null)],
  ["map", new Map()],
  ["atomic", "a string"],
  ["atomic", Symbol.for("hello")],
  ["iterable", (function*() {})()],
  ["atomic", 234],
  ["atomic", 234.234],
  ["atomic", true],
  ["atomic", new Date()],
];

export const access_type_tests = ACCESS_TYPE_TESTS.map(
  ([expected, value]) => access_type(value) === expected
);
