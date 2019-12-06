function* prime_factors(n) {
  if (n < 3) return;
  let count = 0,
    m = n,
    i = 2,
    h = Math.ceil(n / 2);
  do {
    while (m % i === 0) {
      count++;
      yield i;
      m /= i;
    }
    i++;
  } while (i <= h);
  // prime... but there's got to be a better way
  if (count === 0) yield n;
}

function* all_factors(n) {
  let count = 0,
    m = n,
    i = 2,
    h = Math.ceil(n / 2);
  do {
    while (m % i === 0) {
      count++;
      // yield [i, n / i];
      // yield [n / i, i];
      yield [m, n / m];
      yield [n / m, m];
      m /= i;
    }
    i++;
  } while (i <= h);
  // if (count === 0) yield [n, 1];
}

const factorize = n => [...prime_factors(n)];
const factorize_full = n => [...all_factors(n)];

module.exports = { prime_factors, all_factors, factorize, factorize_full };

module.exports.visit_prime_factors = {
  moves_from: n => factorize(n).map(n => [n]),
};
module.exports.visit_all_factors = { moves_from: factorize_full };
