const pt = require("@def.codes/process-trees");

const timeout = (ms, value) =>
  new Promise(resolve => setTimeout(resolve(value), ms));

const thing = timeout(2000, "abc");

thing.then(value => console.log(`HAAAAY !value`, value));

module.exports = {
  main() {
    return thing;
  },
};
