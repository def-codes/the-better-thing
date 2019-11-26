export interface ThingDescription {
  origin: {
    // how to reference this?  is this resolved already, or a term?
    readonly ctor: string;
    // or rather, any comparable
    arguments: readonly any[];
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

export interface ThingChildrenSpec {
  readonly [key: string]: ThingDescription;
}
