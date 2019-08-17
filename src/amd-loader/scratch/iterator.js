// synchronous iterator
(function() {
  const make_counter = () => {
    let value = 0;
    return {
      [Symbol.iterator]: () => ({
        next: () => (value++ < 5 ? { value, done: false } : { done: true }),
      }),
    };
  };

  for (const blah of make_counter()) console.log(`blah`, blah);
})();
