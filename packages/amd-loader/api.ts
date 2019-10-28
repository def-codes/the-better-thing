export type MaybeAsync<T> = T | PromiseLike<T>;

export interface AMDFactoryFunction {
  // AMD allows any kind of export, though for ES2015 compatibility you should
  // only export objects.
  (...imports: readonly any[]): any;
}

export type AMDFactory = AMDFactoryFunction | object;

export interface AMDNamedDefineFunction {
  (id: string, dependencies: readonly string[], factory: AMDFactory): void;
  (id: string, factory: AMDFactory): void;
}

/** “This specification reserves the global variable "require" for use by module
 * loaders. Module loaders are free to use this global variable as they see
 * fit. They may use the variable and add any properties or functions to it as
 * desired for module loader specific functionality. They can also choose not to
 * use "require" as well.”
 * https://github.com/amdjs/amdjs-api/blob/master/AMD.md#global-variables-
 */
export interface AMDRequire {
  // Return value is not specified
  (dependencies: readonly string[], factory?: AMDFactory);
  [key: string]: any;
  // Extension
  // (dependencies: readonly string[]): Promise<object>;
}

// Similar to require
interface AMDAnonymousDefine {
  (dependencies: readonly string[], factory: AMDFactory);
  (factory: AMDFactory);
}

export interface AMDDefineFunction
  extends AMDNamedDefineFunction,
    AMDAnonymousDefine {}

export interface AMDDefine extends AMDDefineFunction {
  amd: object;
}

export interface AMDGlobals {
  define: AMDDefine;
  require: AMDRequire;
}
