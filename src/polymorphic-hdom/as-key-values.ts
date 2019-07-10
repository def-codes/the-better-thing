import { polymethod } from "@def.codes/polymorphic-functions";

/** Return a sequence of key-value tuples representing a collection.  The
 * key-values should be suitable for use with datafy/nav, so `Set` keys are
 * `null` (rather than the value, which is what `Set.entries()` does). */
export const as_key_values = polymethod<Iterable<[any, any]>>("as-key-values");
as_key_values.extend(null, () => []);
as_key_values.extend(Object, object => Object.entries(object));
as_key_values.extend(String, () => []); // Object.entries returns chars!
as_key_values.extend(Array, array => array.entries());
as_key_values.extend(Map, map => map.entries());
// Could do lazily with tx
as_key_values.extend(Set, set => Array.from(set, value => [null, value]));
