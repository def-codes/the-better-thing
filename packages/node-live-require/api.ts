import { ISubscribable } from "@thi.ng/rstream";

export type NodeRequireCache = Record<string, NodeModule>;

// Everything below is crap

// Once more...
// invalidated (transitive)
// define invalidates (but doesn't push)

export interface DependencyDescription {
  readonly module_id: string;
  readonly dependency: string;
}

export interface DefinitionDescription {
  readonly module_id: string;
  readonly exports: any;
}

export interface LiveRequireFunction {
  (module_id: string): LiveRequire;
}

export interface LiveRequire {
  // sink for new definitions of a given module
  define(module_id: string, code: string): void;

  readonly required: ISubscribable<DependencyDescription>;
  readonly defined: ISubscribable<DefinitionDescription>;
}
