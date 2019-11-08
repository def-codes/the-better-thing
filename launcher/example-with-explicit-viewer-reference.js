const { rstream_dot_updater } = require("./rstream-viewer");
const rs = require("@thi.ng/rstream");
const tx = require("@thi.ng/transducers");

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

async function do_ticker_chain() {
  let last = rs.fromInterval(1000);
  const root = last;

  const updater = rstream_dot_updater(root);

  for (let n = 0; n < 10; n++) {
    last = last.subscribe(tx.map(x => x * 2));
    updater.go();
    await timeout(500);
  }
}

module.exports = { do_ticker_chain };
