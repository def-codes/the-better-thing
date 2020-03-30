// Alternate, hijacked console implementation.  Load for side-effects.  Creates
// a stream source function for console entries in well-known location.  Provide
// console entries as a subscribable without needing to have loaded a
// subscription implementation.  Expecting source to be constructed only once.

import {
  CONSOLE_METHODS,
  ConsoleSource,
  ConsoleStream,
  PreservedConsole,
} from "./api";

export function hijack_console() {
  const orig: PreservedConsole = {}; // escape hatch
  let _stream: ConsoleStream;

  const source: ConsoleSource = stream => {
    _stream = stream;
  };

  // TODO: Only hijack methods once you have a subscriber.  Otherwise you just
  // lose any messages sent prior.
  Object.assign(console, { orig, source });

  for (const method of CONSOLE_METHODS) {
    orig[method] = console[method];
    try {
      console[method] = function (...args: any[]) {
        if (_stream) _stream.next({ method, args });
        if (method === "error") orig.error(...args);
      };
    } catch (error) {
      orig.log("ERROR: ", error);
      throw error;
    }
  }
}
