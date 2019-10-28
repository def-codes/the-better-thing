import { setImmediate } from "./helpers/setImmediate";

export type Scheduler<T = any> = (t?: T) => Promise<T>;

/** A scheduler that resolves to a given value at the next chance. */
export const immediate: Scheduler = value =>
  new Promise(resolve => setImmediate(() => resolve(value)));

/** Create a stateful scheduler that provides a callback to trigger the next
 * step. */
export const manual = (): Scheduler => {
  let _trigger: (() => void) | null = null;

  return Object.assign(
    // Use a named function for better stack traces.
    function schedule(input) {
      return new Promise(resolve => {
        _trigger = () => {
          _trigger = null;
          resolve(input);
        };
      });
    },
    {
      // this doesn't know whether the actuator is complete... caller's job
      maybe_tick() {
        if (_trigger !== null) return _trigger(), true;
        return false;
      },
    }
  );
};
