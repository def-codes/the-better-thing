export type MaybeAsync<T> = T | PromiseLike<T>;

export interface AMDFactoryFunction {
  // AMD allows any kind of export, though for ES2015 compatibility you should
  // only export objects.
  (...imports: readonly any[]): any;
}

export type AMDFactory = AMDFactoryFunction | object;

export interface AMDRequire {
  (dependencies: readonly string[], factory: AMDFactory): void;
  // Extension
  // (dependencies: readonly string[]): Promise<object>;
}

export interface AMDDefineFunction extends AMDRequire {
  (name: string, dependencies: readonly string[], factory: AMDFactory): void;
}

export interface AMDDefine extends AMDDefineFunction {
  amd: object;
}

export interface AMDGlobals {
  define: AMDDefine;
  require: AMDRequire;
}
