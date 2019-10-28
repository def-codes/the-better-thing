import { Process } from "./system";
import { Channel } from "./channels";

// In lieu of transducers.
export const mapping_process = function* mapping_process<I, O>(
  this: Process,
  fn: (input: I) => O,
  input: Channel<I>,
  output: Channel<O>
) {
  for (;;) yield this.put(output, fn(yield this.take(input)));
};

export const filtering_process = function* filtering_process<T>(
  this: Process,
  pred: (t: T) => boolean,
  input: Channel<T>,
  output: Channel<T>
) {
  for (;;) {
    const value = yield this.take(input);
    if (pred(value)) yield this.put(output, value);
  }
};
