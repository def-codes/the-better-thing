(function() {
  const sleep = ms => new Promise(resolve => window.setTimeout(resolve, ms));

  const make_async_counter = () => {
    let value = 0;
    return {
      [Symbol.asyncIterator]() {
        return {
          next() {
            return sleep(1000).then(() => {
              if (value++ < 5) return { value, done: false };
              return { done: true };
            });
          },
        };
      },
    };
  };

  (async function() {
    let i = 0;
    for await (const blah of make_async_counter()) {
      if (i++ > 10) {
        console.log(`exceeded`);
        break;
      }
      console.log(`blah`, blah);
    }
  })();
})();
