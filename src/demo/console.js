// Alternate, hijacked console implementation.  Load for side-effects.
// CONSOLE IS DEAD LONG LIVE CONSOLE

// Create stream source function for console entries in well-known location.

// Idea is to provide console entries as a subscribable without needing to have
// loaded a subscription implementation.  Expecting source to be constructed
// only once.

(function() {
  const orig = {}; // escape hatch
  let _sub;

  const source = sub => (_sub = sub);

  Object.assign(console, { orig, source });

  for (const method of ["log", "warn", "error"]) {
    orig[method] = console[method];
    try {
      console[method] = function(...args) {
        if (_sub) _sub.next({ method, args });
        if (method === "error") orig.error(...args);
      };
    } catch (error) {
      orig.log("ERROR: ", error);
      throw error;
    }
  }
})();
