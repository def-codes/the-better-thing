import { MaybeAsync } from "./api";

interface PendingItem<T> {
  promise: Promise<T>;
  // Same as first argument (`resolve`) to `Promise` executor
  resolve: (value?: MaybeAsync<T>) => void;
}

/** General-purpose async registry for coordinating requests with things.  Lets
 *  consumers await items until providers register them by name. */
export class AsyncMap<K, V> extends Map<K, MaybeAsync<V>> {
  readonly pending = new Map<K, PendingItem<V>>();

  async get(key: K) {
    if (super.has(key)) return super.get(key);
    if (this.pending.has(key)) return this.pending.get(key).promise;

    const promise = new Promise<V>(resolve => {
      this.pending.set(key, { promise, resolve });
    }).finally(() => this.pending.delete(key));

    return promise;
  }

  set(key: K, value: V) {
    if (this.pending.has(key)) this.pending.get(key).resolve(value);
    return super.set(key, value);
  }
}
