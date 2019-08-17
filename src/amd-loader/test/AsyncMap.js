class AsyncMap1 extends Map {
  pending = new Map();

  async get(key) {
    if (super.has(key)) return super.get(key);
    if (this.pending.has(key)) return this.pending.get(key).promise;

    const promise = new Promise(resolve => {
      this.pending.set(key, { promise, resolve });
    }).finally(() => this.pending.delete(key));

    return promise;
  }

  set(key, value) {
    if (this.pending.has(key)) this.pending.get(key).resolve(value);
    return super.set(key, value);
  }
}
