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

type Proto<T> = Deconstruct<T> extends never ? T : Deconstruct<T>;

export interface Polymethod<T, A extends any[]> {
  (...args: A): T;
  extend(type_iri: string, implementation: (...args: A) => T): void;
  extend<P extends object>(
    type: P,
    implementation: (
      first: Proto<P>,
      // TS: Tricky to work “rest” of A back in here
      ...rest: [A[1]?, A[2]?, A[3]?, A[4]?, A[5]?]
    ) => T
  ): void;
}
