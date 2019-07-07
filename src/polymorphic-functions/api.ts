type UnboxPrimitive<T> = T extends Number
  ? number
  : T extends String
  ? string
  : T extends Boolean
  ? boolean
  : T extends Symbol
  ? symbol
  : T;

/** Get the type of object that T constructs, if any. */
type Deconstruct<T> = T extends { new (...args: any[]): infer W }
  ? UnboxPrimitive<W>
  : never;

// monotonic.  you cannot retract implementations once they've been added
export interface Polymethod<T, A extends any[]> {
  (...args: A): T;
  // Doesn't use args A?
  extend<C extends Function>(
    type: C,
    implementation: (first: Deconstruct<C>) => T
  ): void;
  extend(type_iri: string, implementation: (...args: A) => T): void;
}
