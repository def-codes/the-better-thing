export interface Polymethod<T, A extends any[]> {
  (...args: A): T;
  // monotonic.  you cannot retract implementations once they've been added
  // extend(type: PropertyKey, implementation: (...args: A) => T): void;
  extend_by_prototype(
    prototype: object,
    implementation: (...args: A) => T
  ): void;
  extend_by_iri(iri: string, implementation: (...args: A) => T): void;
}
