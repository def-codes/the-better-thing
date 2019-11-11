// create a dataflow whereof you can see the values as they flow
const rs = require("@thi.ng/rstream");
const tx = require("@thi.ng/transducers");

function factorize(n) {
  let v = n;
  const factors = [];
  let f = 2;
  while (f <= v) {
    if (v % f === 0) {
      v /= f;
      factors.push(f);
    } else f++;
  }
  return factors;
}

module.exports.main = function() {
  const ticker = rs.fromInterval(1000);
  ticker.id = "ticker";
  const square = x => x * x;
  const double = x => x * 2;
  const squared = ticker.transform(tx.map(square), "squared");
  const doubled = squared.transform(tx.map(double), "doubled");
  const factorized = ticker.transform(tx.map(factorize), "factorized");

  return [ticker];
};
