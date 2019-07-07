const { datafy, datafy_protocol, built_ins } = require("@def.codes/datafy-nav");
const { inspect } = require("util");

const log = (...args) =>
  console.log(...args.map(x => inspect(x, { depth: null })));

const error = Error("something happened");
//log("error before", datafy(error));

built_ins.datafy_Error();

log("error after", datafy(error));

built_ins.datafy_Function();

log("fun 1", datafy(() => {}));
log("fun 2", datafy(a => `(${a})`));
