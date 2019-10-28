// minimum viable setImmediate shim for node or browser

// This should be in (compiler config) environment with these types known?
declare var self: { setImmediate?: Function } | undefined;

export const setImmediate = (function(global) {
  if (global && global.setImmediate) return global.setImmediate;
  return fn => setTimeout(fn, 1);
})(
  typeof self === "object"
    ? self
    : typeof global === "object"
    ? global
    : undefined
);
