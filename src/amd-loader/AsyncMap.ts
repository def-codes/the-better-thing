/** General-purpose async registry for coordinating requests with things.  Lets
 *  consumers await items until providers register them by name. */

interface PendingItem<T> {
  promise: Promise<T>;
  // Same as first argument (`resolve`) to `Promise` executor
  resolve: (value?: T | PromiseLike<T>) => void;
}

export class AsyncMap<K, V> extends Map<K, V | Promise<V>> {
  readonly pending = new Map<K, PendingItem<V>>();

  protected promise_for(key: K): Promise<V> {
    if (this.pending.has(key)) return this.pending.get(key).promise;

    const promise = new Promise<V>(resolve => {
      this.pending.set(key, { promise, resolve });
    }).then(value => {
      this.pending.delete(key);
      return value;
    });

    return promise;
  }

  async get(key: K) {
    return this.has(key) ? super.get(key) : this.promise_for(key);
  }

  set(key: K, value: V | Promise<V>) {
    if (this.pending.has(key)) this.pending.get(key).resolve(value);
    return super.set(key, value);
  }
}
