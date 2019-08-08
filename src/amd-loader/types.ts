// These are all provisional
// used only internally
import { AMDFactory, AMDDefineFunction, AMDGlobals, MaybeAsync } from "./api";

export interface ModuleLoadingContext {
  readonly url: string;
}

export interface ModuleExecutionContext {
  readonly given_name: string | undefined;
  readonly needs: readonly string[];
  readonly factory: AMDFactory;
}

export interface ModuleContext
  extends ModuleLoadingContext,
    ModuleExecutionContext {}

export interface ModuleWithContext extends ModuleContext {
  readonly module: object;
}

type ModuleIdentifier = string;

// Standalone: a static module resolver function can
declare function resolve_module(
  identifier: ModuleIdentifier,
  context: ModuleContext
): Promise<object>;

export type RequireAbsolute = (url: string) => MaybeAsync<ModuleWithContext>;
export type ModuleResolver = (
  id: string,
  context?: ModuleContext
) => MaybeAsync<object>;

export type ModuleNameResolver = (
  name: string,
  base?: string | null
) => MaybeAsync<string>;
