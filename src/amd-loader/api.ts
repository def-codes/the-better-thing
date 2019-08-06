export interface AMDFactory {
  // AMD allows any kind of export, though for ES2015 compatibility you should
  // only export objects.
  (...imports: readonly any[]): any;
}

export interface AMDRequire {
  (dependencies: readonly string[], factory: AMDFactory): void;
}

export interface AMDDefineFunction extends AMDRequire {
  (name: string, dependencies: readonly string[], factory: AMDFactory): void;
}

export interface AMDDefine extends AMDDefineFunction {
  amd: object;
}
