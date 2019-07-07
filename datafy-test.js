const { datafy, datafy_protocol, built_ins } = require("@def.codes/datafy-nav");
const { inspect } = require("util");

const log = (...args) =>
  console.log(...args.map(x => inspect(x, { depth: null })));

built_ins.datafy_Object();

const error = Error("something happened");
log("error before", datafy(error));

built_ins.datafy_Error();
const datafied_error = datafy(error);
console.log(`datafied_error.prototype`, datafied_error.prototype);
console.log(`datafied_error.prototype`, Object.getPrototypeOf(datafied_error));

log("error after", datafied_error);

built_ins.datafy_Function();

log("fun 1", datafy(() => {}));
log("fun 2", datafy(a => `(${a})`));
