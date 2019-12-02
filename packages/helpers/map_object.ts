// This uses conditional types to get better call-site inference for map_object.

type Mapped<T extends object, U = any> = { [P in keyof T]: U };

type MOCallback<I, O> = (value: Undict<I>, key: keyof I, source: I) => O;

// Can't you just do T[PropertyKey]?
type Undict<T> = T extends { [k in keyof T]: infer P } ? P : unknown;

// This is the closest you can get without higher-kinded types (I think)
export interface MapObject {
  <I extends object, OP>(map: MOCallback<I, OP>, source: I): Mapped<I, OP>;
}

/** Map an object's values over a function, or return a function to do so. */
// what if you want to change the key?
export const map_object: MapObject = function map_object(map, source) {
  if (arguments.length === 1) return source => map_object(map, source);

  const target = {};

  for (const key of Object.keys(source))
    target[key] = map(source[key], key as keyof typeof source, source);

  return target;
} as MapObject;
