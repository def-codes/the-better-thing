export interface LiveRequireCallback {
  (pair: { module_id: string; dependency: string }): void;
}

export interface LiveRequireConstructor {
  // callback is for notifying of new dependencies
  (callback: LiveRequireCallback): LiveRequire;
}

export interface LiveRequire {
  // sink for new definitions of a given module
  define(module_id: string, code: string): void;
}
