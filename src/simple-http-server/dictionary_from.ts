// This is a general function but currently not used in any other package.
const identity = <T>(value: T): T => value;

/** Create a plain JavaScript object using the given sequence and callbacks. */
export function dictionary_from<
  TIn,
  TOut,
  K extends PropertyKey = TIn extends PropertyKey ? TIn : PropertyKey
>(
  inputs: Iterable<TIn>,
  get_value: (t: TIn, index: number) => TOut,
  // TS: Signature doesn't indicate that this is legal
  get_key: (t: TIn, index: number) => K = x => (<unknown>x) as K
): Record<K, TOut> {
  const _get_value = get_value || identity;
  const dict = Object.create(null);
  let index = 0;
  for (const key of inputs) {
    dict[get_key(key, index)] = _get_value(key, index);
    index++;
  }
  return dict;
}
