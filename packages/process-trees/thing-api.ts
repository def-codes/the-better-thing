export interface ThingDescription {
  origin: {
    // how to reference this?  is this resolved already, or a term?
    readonly ctor: string;
    // or rather, any comparable
    arguments: readonly any[];
  };
}

export type ThingUpdateInstruction =
  | { readonly operation: "delete"; readonly key: string }
  | {
      readonly operation: "add" | "update";
      readonly key: string;
      readonly description: ThingDescription;
    };

export interface ThingChildrenSpec {
  readonly [key: string]: ThingDescription;
}
