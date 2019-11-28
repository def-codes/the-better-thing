// Representation layer for low-level creation methods.
//
// Two recipes can be compared for equality to tell whether they represent the
// “same” recipe, to the extent that reference equality is maintained between
// their non-primitive elements.
import { assert_unreachable } from "@def.codes/helpers";

// General binding types
interface ConstructorBinding<A extends any[]> {
  readonly ctor: { new (...args: A): void };
  readonly args: Readonly<A>;
}

interface FunctionBinding<A extends any[]> {
  readonly fn: { (...args: A): void };
  readonly args: Readonly<A>;
}

interface ConstructorSpec<A extends any[]> extends ConstructorBinding<A> {
  readonly type: "constructor";
}

interface FunctionSpec<A extends any[]> extends FunctionBinding<A> {
  readonly type: "function";
}

interface PrototypeSpec {
  readonly type: "prototype";
  readonly proto: object;
}

export type MintSpec =
  | ConstructorSpec<any[]>
  | FunctionSpec<any[]>
  | PrototypeSpec;

export const mint = (spec: MintSpec): any => {
  if (spec.type === "constructor") return new spec.ctor(...spec.args);
  if (spec.type === "function") return spec.fn(...spec.args);
  if (spec.type === "prototype") return Object.create(spec.proto);
  assert_unreachable(spec, "mint");
};
