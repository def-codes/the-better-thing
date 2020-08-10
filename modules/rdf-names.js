define([], () => {
  const target = {};
  const mint = new Proxy(target, {
    get() {
      return mint;
    },
  });

  return { mint };
});
