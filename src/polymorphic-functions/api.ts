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
  extend<P extends object>(
    type: P,
    implementation: (first: Proto<P>) => T,
    ...rest: any[] // TS: Tricky to work “rest” of A back in here
  ): void;
  extend(type_iri: string, implementation: (...args: A) => T): void;
}
