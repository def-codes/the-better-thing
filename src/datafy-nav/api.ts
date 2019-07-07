// for things with explicit datafy method

export const DATAFY_METADATA: unique symbol = Symbol.for("meld:DatafyMetadata");
export const ORIGINAL: unique symbol = Symbol.for("meld:DatafyOriginalObject");

export interface DatafyMetadata<T> {
  [ORIGINAL]: T;
}

export interface WithDatafyMetadata<T> {
  [DATAFY_METADATA]: DatafyMetadata<T>;
}

// Whether to datafy primitives (including null and undefined) is up to
// implementations.
export type Datafied<T> = T | WithDatafyMetadata<T>;

// OBE? this was before polymorphism via @type IRI.  if you can implement this,
// you can provide a type specifier and use protocol extension.

export interface IDatafiable {
  datafy(): object; // any?
}

export interface INavable {
  nav(): any; // ???
}
