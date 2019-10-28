/** Dispatch multiplier with theoretical backpressure support. */

import { MulticastType, MulticastListener, MulticastSendResult } from "./api";

// Does this need to distinguish "passive" listeners?  I think we need passive
// listeners for viewing, but that could be implemented in a wrapper.

export class Multicast implements MulticastType {
  listeners: Set<MulticastListener>;

  constructor() {
    this.listeners = new Set();
  }

  // Could recognize and forward all args.
  send(message) {
    let result: MulticastSendResult = undefined;
    for (let listener of this.listeners)
      if (listener(message) === false) result = false;

    return result;
  }

  listen(listener) {
    const _listeners = this.listeners.add(listener);
    return {
      cancel() {
        _listeners.delete(listener);
      },
    };
  }
}
