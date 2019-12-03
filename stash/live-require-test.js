const { live_require } = require("@def.codes/node-live-require");

const { define, defined, required } = live_require("./sketch");

required.subscribe({
  next(msg) {
    console.log(`Module ${msg.module_id} required ${msg.dependency}`);
  },
});

defined.subscribe({
  next(msg) {
    console.log(`Module ${msg.module_id} was defined, exporting`, msg.exports);
  },
});

define("./some-lib", "module.exports = {version: 1}");
define("./some-lib", "module.exports = {version: 2}");
