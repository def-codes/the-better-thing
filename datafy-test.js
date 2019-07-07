const {
  datafy,
  nav,
  nav_protocol,
  datafy_protocol,
  built_ins
} = require("@def.codes/datafy-nav");
const { inspect } = require("util");

const log = (...args) =>
  console.log(...args.map(x => inspect(x, { depth: null })));

built_ins.extend_Object.datafy();
built_ins.extend_Object.nav();

const error = Error("something happened");
log("error before", datafy(error));

built_ins.extend_Error.datafy();
const datafied_error = datafy(error);
console.log(`datafied_error.prototype`, datafied_error.prototype);
console.log(`datafied_error.prototype`, Object.getPrototypeOf(datafied_error));

log("error after", datafied_error);

built_ins.extend_Function.datafy();

log("fun 1", datafy(() => {}));
log("fun 2", datafy(a => `(${a})`));

// New that `Date()` just returns a string.
// http://es5.github.io/#x15.9
log("date before", datafy(new Date()));
built_ins.extend_Date.datafy();
log("date after", datafy(new Date()));

function try_nav() {
  const something = {
    name: "Alice",
    age: 1e8,
    occupation: "hazard",
    aliases: ["Alistair", "Alibaba", "Alioop"]
  };
  console.log(`something`, something);

  const datafied1 = datafy(something);
  console.log(`datafied`, datafied1);

  const nav1 = nav(something, null, datafied1);
  console.log(`nav1`, nav1);
}

try_nav();
