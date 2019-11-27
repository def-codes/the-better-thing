export interface ThingDescription {
  readonly extends: {
    // how to reference this?  is this resolved already, or a term?
    readonly ctor: Function;
    // or preferably, any comparable
    readonly args: readonly any[];
  };
}

interface Instruction<T extends string> {
  readonly operation: T;
  readonly key: string;
}

export type ThingUpdateInstruction =
  | Instruction<"delete">
  | (Instruction<"add"> & { readonly description: ThingDescription })
  | (Instruction<"update"> & { readonly description: ThingDescription });

export interface ChildrenSpec {
  readonly [key: string]: ThingDescription;
}
