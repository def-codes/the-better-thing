import { has_items } from "@def.codes/helpers";

/** A directional, synchronizing queue between readers and writers.

 A channel maintains the invariants:
 - no pending puts when the queue is empty
 - no pending takes unless the queue is empty
 */
export class Channel<T = any> {
  readonly size: number;
  readonly queue: T[] = [];
  readonly pending_puts: [() => void, T][] = [];
  readonly pending_takes: ((t: T) => void)[] = [];

  constructor(size) {
    this.size = typeof size === "number" ? size : 1;
  }
  put(value: T) {
    if (has_items(this.pending_takes)) this.pending_takes.shift()(value);
    else if (this.queue.length < this.size) this.queue.push(value);
    else new Promise(resolve => this.pending_puts.push([resolve, value]));
  }
  take() {
    if (has_items(this.queue)) {
      const value = this.queue.shift();
      if (has_items(this.pending_puts)) {
        const [resolve, pending_value] = this.pending_puts.shift();
        this.queue.push(pending_value);
        resolve();
      }
      return value;
    }
    return new Promise<T>(resolve => this.pending_takes.push(resolve));
  }
}
