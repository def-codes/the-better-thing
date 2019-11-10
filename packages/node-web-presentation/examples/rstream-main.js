const rs = require("@thi.ng/rstream");
const tx = require("@thi.ng/transducers");

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

function main() {
  let last = rs.fromInterval(1000);
  const root = last;

  async function go() {
    for (let n = 0; n < 10; n++) {
      last = last.subscribe(tx.map(x => x * 2));
      await timeout(500);
    }
  }

  go();
  return [root];
}

module.exports = { main };
