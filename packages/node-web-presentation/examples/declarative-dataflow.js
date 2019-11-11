// create a dataflow whereof you can see the values as they flow
const pt = require("@def.codes/process-trees");
const { dictionary_from } = require("@def.codes/helpers");
const tx = require("@thi.ng/transducers");
const { proc, x_proc, interval, map, make_process_tree } = pt;

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
const times = n => x => x * n;
const square = x => x * x;
const double = x => times(2);

const many_waters = m =>
  dictionary_from(tx.range(Math.round(m / 3)), k => x_proc(map(times(k))));

module.exports.main = () =>
  make_process_tree(
    proc(interval(1000), n => ({
      spread: pt.proc(".", many_waters),
      squared: x_proc(map(square), () => ({
        doubled: x_proc(map(double)),
      })),
      factorized: x_proc(map(factorize)),
    }))
  ).output;
