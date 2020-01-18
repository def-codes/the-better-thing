// TS: Support mapping of tuples to tuples.
// See https://github.com/microsoft/TypeScript/issues/29841
interface ReadonlyArray<T> {
  map<TThis extends ReadonlyArray<T>, U>(
    this: TThis,
    fn: (v: T) => U
  ): { [K in keyof TThis]: U };
}
