(function() {
  const sleep = ms => new Promise(resolve => window.setTimeout(resolve, ms));

  // well, not exactly a channel as writes never block (i.e. it has no max buffer size)
  const channel = () => {
    const pending_reads = [];
    const pending_writes = [];
    return {
      write(value) {
        if (pending_reads.length) pending_reads.pop()({ value });
        else pending_writes.push(value);
      },
      [Symbol.asyncIterator]() {
        return {
          next() {
            return new Promise(resolve => {
              if (pending_writes.length)
                resolve({ value: pending_writes.pop() });
              else pending_reads.push(resolve);
            });
          },
        };
      },
    };
  };

  const chan = channel();

  "once upon a time and a very good time it was".split(" ").map(chan.write);

  (async function() {
    let i = 0;
    for await (const blah of chan) {
      if (i++ > 100) {
        console.log(`chan exceeded`);
        break;
      }
      console.log(`chan blah`, blah);
    }
  })();

  (async function() {
    chan.write("hello");
    await sleep(1000);
    chan.write("world");
    await sleep(1000);
    chan.write("done");
  })();
})();
