// given a program name and a set of arguments,
// launch that program and capture its reflection
// possible strategies:
// - do shell launch and pass through arguments
//   - but then how would you capture anything from the runtime?
//   - node may provide facilities for this
//     - but I think remote has to participate, which defeats the purpose
// - make an ad-hoc script that requires the module and
//   - runs a designated method, or
//   - scans global namespace
//     - could even proxy this to detect changes
const [, , module_name, ...args] = process.argv;

console.log(`module_name`, module_name);
console.log(`args`, ...args);

function fail_usage() {
  process.stderr.write("usage: launcher <module> <method>\n");
  process.exit(1);
}

(async function() {
  const [method_name] = args;
  if (!module_name || !method_name) fail_usage();
  const it = require(module_name);
  await it[method_name]();
})();
