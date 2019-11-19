// proxy wrapper for general-purpose MELD thing

const HANDLERS: ProxyHandler<object> = {
  get(target, key, receiver) {
    console.log(`THING get`, key);
  },
};

export const make_thing = () => {
  // maybe make the *prototype* a proxy?  so you can have normal resolution for
  // things that do exist and don't need to be tracked.
  const target = {};
  return new Proxy(target, HANDLERS);
};
