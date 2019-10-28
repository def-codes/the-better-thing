// Types for checking path tuples against known types.

// Choosing `number` for array types is more in line with expected behavior.
// Otherwise the keys of array types would be those of the prototype methods.
// Intersecting with `PropertyKey` causes literals (instead of `string`) to be
// inferred at call sites, which narrows the search when used in path checking.
type KeyOf<T> = PropertyKey & (T extends any[] ? number : keyof T);
type KO<T> = KeyOf<T>;

/** Get the child item type of `T`, either its array element type or the type at
 * property `K` This is the counterpart to `KeyOf` for drilling paths. */
type TypeAt<T, K> = T extends (infer E)[]
  ? E
  : K extends keyof T
  ? T[K]
  : unknown;

// Shorthands
// Remove `null` and `undefined` at bottom so that paths don't dead-end.
type T1<T, A> = NonNullable<TypeAt<T, A>>;
type T2<T, A, B> = T1<T1<T, A>, B>;
type T3<T, A, B, C> = T1<T2<T, A, B>, C>;
type T4<T, A, B, C, D> = T1<T3<T, A, B, C>, D>;
type T5<T, A, B, C, D, E> = T1<T4<T, A, B, C, D>, E>;
type T6<T, A, B, C, D, E, F> = T1<T5<T, A, B, C, D, E>, F>;
type T7<T, A, B, C, D, E, F, G> = T1<T6<T, A, B, C, D, E, F>, G>;
type T8<T, A, B, C, D, E, F, G, H> = T1<T7<T, A, B, C, D, E, F, G>, H>;
type T9<T, A, B, C, D, E, F, G, H, I> = T1<T8<T, A, B, C, D, E, F, G, H>, I>;

/** For a given object, accept a sequence of valid keys as arguments and return
 * the value at the target location. */
export interface PathGetter {
  <T, A extends KO<T>>(t: T, a: A): T1<T, A>;

  <T, A extends KO<T>, B extends KO<T1<T, A>>>(t: T, a: A, b: B): T2<T, A, B>;

  <T, A extends KO<T>, B extends KO<T1<T, A>>, C extends KO<T2<T, A, B>>>(
    t: T,
    a: A,
    b: B,
    c: C
  ): T3<T, A, B, C>;

  <
    T,
    A extends KO<T>,
    B extends KO<T1<T, A>>,
    C extends KO<T2<T, A, B>>,
    D extends KO<T3<T, A, B, C>>
  >(
    t: T,
    a: A,
    b: B,
    c: C,
    d: D
  ): T4<T, A, B, C, D>;

  // 5 ary
  <
    T,
    A extends KO<T>,
    B extends KO<T1<T, A>>,
    C extends KO<T2<T, A, B>>,
    D extends KO<T3<T, A, B, C>>,
    E extends KO<T4<T, A, B, C, D>>
  >(
    t: T,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E
  ): T5<T, A, B, C, D, E>;

  // 6 ary
  <
    T,
    A extends KO<T>,
    B extends KO<T1<T, A>>,
    C extends KO<T2<T, A, B>>,
    D extends KO<T3<T, A, B, C>>,
    E extends KO<T4<T, A, B, C, D>>,
    F extends KO<T5<T, A, B, C, D, E>>
  >(
    t: T,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F
  ): T6<T, A, B, C, D, E, F>;

  // 7 ary
  <
    T,
    A extends KO<T>,
    B extends KO<T1<T, A>>,
    C extends KO<T2<T, A, B>>,
    D extends KO<T3<T, A, B, C>>,
    E extends KO<T4<T, A, B, C, D>>,
    F extends KO<T5<T, A, B, C, D, E>>,
    G extends KO<T6<T, A, B, C, D, E, F>>
  >(
    t: T,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F,
    g: G
  ): T7<T, A, B, C, D, E, F, G>;

  // 8 ary
  <
    T,
    A extends KO<T>,
    B extends KO<T1<T, A>>,
    C extends KO<T2<T, A, B>>,
    D extends KO<T3<T, A, B, C>>,
    E extends KO<T4<T, A, B, C, D>>,
    F extends KO<T5<T, A, B, C, D, E>>,
    G extends KO<T6<T, A, B, C, D, E, F>>,
    H extends KO<T7<T, A, B, C, D, E, F, G>>
  >(
    t: T,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F,
    g: G,
    h: H
  ): T8<T, A, B, C, D, E, F, G, H>;

  // 9 ary
  <
    T,
    A extends KO<T>,
    B extends KO<T1<T, A>>,
    C extends KO<T2<T, A, B>>,
    D extends KO<T3<T, A, B, C>>,
    E extends KO<T4<T, A, B, C, D>>,
    F extends KO<T5<T, A, B, C, D, E>>,
    G extends KO<T6<T, A, B, C, D, E, F>>,
    H extends KO<T7<T, A, B, C, D, E, F, G>>,
    I extends KO<T8<T, A, B, C, D, E, F, G, H>>
  >(
    t: T,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F,
    g: G,
    h: H,
    i: I
  ): T9<T, A, B, C, D, E, F, G, H, I>;

  // 10 and up, but moreso for arg spread.
  (obj: object, ...path: any[]): any;
}

export interface PathSetter<T, R = void> {
  <A extends KO<T>>(a: A): (value: T1<T, A>) => R;

  <A extends KO<T>, B extends KO<T1<T, A>>>(a: A, b: B): (
    value: T2<T, A, B>
  ) => R;

  <A extends KO<T>, B extends KO<T1<T, A>>, C extends KO<T2<T, A, B>>>(
    a: A,
    b: B,
    c: C
  ): (value: T3<T, A, B, C>) => R;

  <
    A extends KO<T>,
    B extends KO<T1<T, A>>,
    C extends KO<T2<T, A, B>>,
    D extends KO<T3<T, A, B, C>>
  >(
    a: A,
    b: B,
    c: C,
    d: D
  ): (value: T4<T, A, B, C, D>) => R;

  // 5 ary
  <
    A extends KO<T>,
    B extends KO<T1<T, A>>,
    C extends KO<T2<T, A, B>>,
    D extends KO<T3<T, A, B, C>>,
    E extends KO<T4<T, A, B, C, D>>
  >(
    a: A,
    b: B,
    c: C,
    d: D,
    e: E
  ): (value: T5<T, A, B, C, D, E>) => R;
  /*
  // 6 ary
  <
    A extends KO<T>,
    B extends KO<T1<T, A>>,
    C extends KO<T2<T, A, B>>,
    D extends KO<T3<T, A, B, C>>,
    E extends KO<T4<T, A, B, C, D>>,
    F extends KO<T5<T, A, B, C, D, E>>
  >(
    path: [A, B, C, D, E, F],
    value: T6<T, A, B, C, D, E, F>
  ): R;

  // 7 ary
  <
    A extends KO<T>,
    B extends KO<T1<T, A>>,
    C extends KO<T2<T, A, B>>,
    D extends KO<T3<T, A, B, C>>,
    E extends KO<T4<T, A, B, C, D>>,
    F extends KO<T5<T, A, B, C, D, E>>,
    G extends KO<T6<T, A, B, C, D, E, F>>
  >(
    path: [A, B, C, D, E, F, G],
    value: T7<T, A, B, C, D, E, F, G>
  ): R;

  // 8 ary
  <
    A extends KO<T>,
    B extends KO<T1<T, A>>,
    C extends KO<T2<T, A, B>>,
    D extends KO<T3<T, A, B, C>>,
    E extends KO<T4<T, A, B, C, D>>,
    F extends KO<T5<T, A, B, C, D, E>>,
    G extends KO<T6<T, A, B, C, D, E, F>>,
    H extends KO<T7<T, A, B, C, D, E, F, G>>
  >(
    path: [A, B, C, D, E, F, G, H],
    value: T8<T, A, B, C, D, E, F, G, H>
  ): R;

  // 9 ary
  <
    A extends KO<T>,
    B extends KO<T1<T, A>>,
    C extends KO<T2<T, A, B>>,
    D extends KO<T3<T, A, B, C>>,
    E extends KO<T4<T, A, B, C, D>>,
    F extends KO<T5<T, A, B, C, D, E>>,
    G extends KO<T6<T, A, B, C, D, E, F>>,
    H extends KO<T7<T, A, B, C, D, E, F, G>>,
    I extends KO<T8<T, A, B, C, D, E, F, G, H>>
  >(
    path: [A, B, C, D, E, F, G, H, I],
    value: T9<T, A, B, C, D, E, F, G, H, I>
  ): R;
*/
  // 10 and up, but moreso for arg spread.
  // (...path: (string | number)[]): (value: any) => R;
}

/** Return the given arguments as an array, typechecking only if they comprise a
 * key sequence defined in the structure of `T`.  This supports the use of
 * call-site inference to assert the validity of literal path expressions.  As
 * such, this must be used in conjunction with an implementation, which is
 * essentially a variadic identity function.  The extension type `X` can be
 * included to add compile-time verification that the output is from a
 * well-known implementor. */
export interface PathChecker<T, X = any> {
  <A extends KO<T>>(a: A): [A] & X;

  <A extends KO<T>, B extends KO<T1<T, A>>>(a: A, b: B): [A, B] & X;

  <A extends KO<T>, B extends KO<T1<T, A>>, C extends KO<T2<T, A, B>>>(
    a: A,
    b: B,
    c: C
  ): [A, B, C] & X;

  <
    A extends KO<T>,
    B extends KO<T1<T, A>>,
    C extends KO<T2<T, A, B>>,
    D extends KO<T3<T, A, B, C>>
  >(
    a: A,
    b: B,
    c: C,
    d: D
  ): [A, B, C, D] & X;

  // 5 ary
  <
    A extends KO<T>,
    B extends KO<T1<T, A>>,
    C extends KO<T2<T, A, B>>,
    D extends KO<T3<T, A, B, C>>,
    E extends KO<T4<T, A, B, C, D>>
  >(
    a: A,
    b: B,
    c: C,
    d: D,
    e: E
  ): [A, B, C, D, E] & X;

  // 6 ary
  <
    A extends KO<T>,
    B extends KO<T1<T, A>>,
    C extends KO<T2<T, A, B>>,
    D extends KO<T3<T, A, B, C>>,
    E extends KO<T4<T, A, B, C, D>>,
    F extends KO<T5<T, A, B, C, D, E>>
  >(
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F
  ): [A, B, C, D, E, F] & X;

  // 7 ary
  <
    A extends KO<T>,
    B extends KO<T1<T, A>>,
    C extends KO<T2<T, A, B>>,
    D extends KO<T3<T, A, B, C>>,
    E extends KO<T4<T, A, B, C, D>>,
    F extends KO<T5<T, A, B, C, D, E>>,
    G extends KO<T6<T, A, B, C, D, E, F>>
  >(
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F,
    g: G
  ): [A, B, C, D, E, F, G] & X;

  // 8 ary
  <
    A extends KO<T>,
    B extends KO<T1<T, A>>,
    C extends KO<T2<T, A, B>>,
    D extends KO<T3<T, A, B, C>>,
    E extends KO<T4<T, A, B, C, D>>,
    F extends KO<T5<T, A, B, C, D, E>>,
    G extends KO<T6<T, A, B, C, D, E, F>>,
    H extends KO<T7<T, A, B, C, D, E, F, G>>
  >(
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F,
    g: G,
    h: H
  ): [A, B, C, D, E, F, G, H] & X;

  // 9 ary
  <
    A extends KO<T>,
    B extends KO<T1<T, A>>,
    C extends KO<T2<T, A, B>>,
    D extends KO<T3<T, A, B, C>>,
    E extends KO<T4<T, A, B, C, D>>,
    F extends KO<T5<T, A, B, C, D, E>>,
    G extends KO<T6<T, A, B, C, D, E, F>>,
    H extends KO<T7<T, A, B, C, D, E, F, G>>,
    I extends KO<T8<T, A, B, C, D, E, F, G, H>>
  >(
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F,
    g: G,
    h: H,
    i: I
  ): [A, B, C, D, E, F, G, H, I] & X;
}

/** Like `PathChecker` but with an arbitrary return type. */
export interface WithCheckedPath<T, R> {
  <A extends KO<T>>(path: [A]): R;

  <A extends KO<T>, B extends KO<T1<T, A>>>(path: [A, B]): R;

  <A extends KO<T>, B extends KO<T1<T, A>>, C extends KO<T2<T, A, B>>>(
    path: [A, B, C]
  ): R;

  <
    A extends KO<T>,
    B extends KO<T1<T, A>>,
    C extends KO<T2<T, A, B>>,
    D extends KO<T3<T, A, B, C>>
  >(
    path: [A, B, C, D]
  ): R;

  // 5 ary
  <
    A extends KO<T>,
    B extends KO<T1<T, A>>,
    C extends KO<T2<T, A, B>>,
    D extends KO<T3<T, A, B, C>>,
    E extends KO<T4<T, A, B, C, D>>
  >(
    path: [A, B, C, D, E]
  ): R;

  // 6 ary
  <
    A extends KO<T>,
    B extends KO<T1<T, A>>,
    C extends KO<T2<T, A, B>>,
    D extends KO<T3<T, A, B, C>>,
    E extends KO<T4<T, A, B, C, D>>,
    F extends KO<T5<T, A, B, C, D, E>>
  >(
    path: [A, B, C, D, E, F]
  ): R;

  // 7 ary
  <
    A extends KO<T>,
    B extends KO<T1<T, A>>,
    C extends KO<T2<T, A, B>>,
    D extends KO<T3<T, A, B, C>>,
    E extends KO<T4<T, A, B, C, D>>,
    F extends KO<T5<T, A, B, C, D, E>>,
    G extends KO<T6<T, A, B, C, D, E, F>>
  >(
    path: [A, B, C, D, E, F, G]
  ): R;

  // 8 ary
  <
    A extends KO<T>,
    B extends KO<T1<T, A>>,
    C extends KO<T2<T, A, B>>,
    D extends KO<T3<T, A, B, C>>,
    E extends KO<T4<T, A, B, C, D>>,
    F extends KO<T5<T, A, B, C, D, E>>,
    G extends KO<T6<T, A, B, C, D, E, F>>,
    H extends KO<T7<T, A, B, C, D, E, F, G>>
  >(
    path: [A, B, C, D, E, F, G, H]
  ): R;

  // 9 ary
  <
    A extends KO<T>,
    B extends KO<T1<T, A>>,
    C extends KO<T2<T, A, B>>,
    D extends KO<T3<T, A, B, C>>,
    E extends KO<T4<T, A, B, C, D>>,
    F extends KO<T5<T, A, B, C, D, E>>,
    G extends KO<T6<T, A, B, C, D, E, F>>,
    H extends KO<T7<T, A, B, C, D, E, F, G>>,
    I extends KO<T8<T, A, B, C, D, E, F, G, H>>
  >(
    path: [A, B, C, D, E, F, G, H, I]
  ): R;
}

/** Like `WithCheckedPath` but taking the path as arguments instead of an array. */
export interface WithCheckedPathArgs<T, R> {
  <A extends KO<T>>(a: A): R;

  <A extends KO<T>, B extends KO<T1<T, A>>>(a: A, b: B): R;

  <A extends KO<T>, B extends KO<T1<T, A>>, C extends KO<T2<T, A, B>>>(
    a: A,
    b: B,
    c: C
  ): R;

  <
    A extends KO<T>,
    B extends KO<T1<T, A>>,
    C extends KO<T2<T, A, B>>,
    D extends KO<T3<T, A, B, C>>
  >(
    a: A,
    b: B,
    c: C,
    d: D
  ): R;

  // 5 ary
  <
    A extends KO<T>,
    B extends KO<T1<T, A>>,
    C extends KO<T2<T, A, B>>,
    D extends KO<T3<T, A, B, C>>,
    E extends KO<T4<T, A, B, C, D>>
  >(
    a: A,
    b: B,
    c: C,
    d: D,
    e: E
  ): R;

  // 6 ary
  <
    A extends KO<T>,
    B extends KO<T1<T, A>>,
    C extends KO<T2<T, A, B>>,
    D extends KO<T3<T, A, B, C>>,
    E extends KO<T4<T, A, B, C, D>>,
    F extends KO<T5<T, A, B, C, D, E>>
  >(
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F
  ): R;

  // 7 ary
  <
    A extends KO<T>,
    B extends KO<T1<T, A>>,
    C extends KO<T2<T, A, B>>,
    D extends KO<T3<T, A, B, C>>,
    E extends KO<T4<T, A, B, C, D>>,
    F extends KO<T5<T, A, B, C, D, E>>,
    G extends KO<T6<T, A, B, C, D, E, F>>
  >(
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F,
    g: G
  ): R;

  // 8 ary
  <
    A extends KO<T>,
    B extends KO<T1<T, A>>,
    C extends KO<T2<T, A, B>>,
    D extends KO<T3<T, A, B, C>>,
    E extends KO<T4<T, A, B, C, D>>,
    F extends KO<T5<T, A, B, C, D, E>>,
    G extends KO<T6<T, A, B, C, D, E, F>>,
    H extends KO<T7<T, A, B, C, D, E, F, G>>
  >(
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F,
    g: G,
    h: H
  ): R;

  // 9 ary
  <
    A extends KO<T>,
    B extends KO<T1<T, A>>,
    C extends KO<T2<T, A, B>>,
    D extends KO<T3<T, A, B, C>>,
    E extends KO<T4<T, A, B, C, D>>,
    F extends KO<T5<T, A, B, C, D, E>>,
    G extends KO<T6<T, A, B, C, D, E, F>>,
    H extends KO<T7<T, A, B, C, D, E, F, G>>,
    I extends KO<T8<T, A, B, C, D, E, F, G, H>>
  >(
    a: A,
    b: B,
    c: C,
    d: D,
    e: E,
    f: F,
    g: G,
    h: H,
    i: I
  ): R;

  // 10 and up

  (...args: any[]): R;
}
