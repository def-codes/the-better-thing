// These are all provisional
// used only internally
import { AMDFactory, MaybeAsync } from "./api";

export interface AnonymousModuleDefinition {
  readonly needs: readonly string[];
  readonly factory: AMDFactory;
}

export interface ModuleDefinition extends AnonymousModuleDefinition {
  readonly given_name: string;
}

export interface ModuleFetchContext {
  readonly url: string;
}

export interface ModuleContext extends ModuleFetchContext, ModuleDefinition {}

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
