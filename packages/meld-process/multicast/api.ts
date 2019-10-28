export interface Cancelable {
  cancel(): void;
}

export interface MulticastSendInfo {}

export type MulticastSendResult = undefined | MulticastSendInfo;

export interface MulticastListener<T = any> {
  (value: T): MulticastSendResult;
}

// Inspired by EventTarget in that you can subscribe multiple independent (and
// mutually benign) handlers.  But unlike EventTarget, you don't have a separate
// method for remove.  Inspired by Observable in instead returning an object
// with a cancellation method, instead of void.  This way, you (or someone else)
// can cancel later, without any reference to the publisher.
export interface MulticastType {
  // Not calling this subscribe to avoid confusion with Observable, which has
  // different semantics.
  listen: <T>(listener: MulticastListener<T>) => Cancelable;
  send(message: any): MulticastSendResult;
}
