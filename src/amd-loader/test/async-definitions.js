// amd loader with async maps
(function() {
  const with_async = (base = new Map(), pending = new Map()) =>
    Object.create(base, {
      get: {
        async value(key) {
          if (base.has(key)) return base.get(key);
          if (pending.has(key)) return pending.get(key).promise;

          let resolve;
          const promise = new Promise(_resolve => {
            resolve = _resolve;
          }).finally(() => pending.delete(key));
          pending.set(key, { promise, resolve });

          return promise;
        },
      },
      set: {
        value(key, value) {
          if (pending.has(key)) pending.get(key).resolve(value);
          return base.set(key, value);
        },
      },
    });

  const definitions = with_async();
  const sleep = ms => new Promise(resolve => window.setTimeout(resolve, ms));

  const A = definitions.get("A").then(v => console.log("I got A", v));
  const B = definitions.get("B").then(v => console.log("I got B", v));

  (async function() {
    await sleep(1000);
    console.log(`setting B`);
    definitions.set("B", "beta");

    await sleep(1000);
    console.log(`setting A`);
    definitions.set("A", "alpha");
  })();
})();
