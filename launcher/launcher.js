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
const rs = require("@thi.ng/rstream");
const { rstream_dot_updater } = require("./rstream-viewer");
const [, , module_name, ...args] = process.argv;

function fail_with(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function fail_usage() {
  fail_with("usage: launcher <module> [method]");
}

(async function() {
  if (!module_name) fail_usage();

  let it;
  try {
    it = require(module_name);
  } catch (error) {
    fail_with(`abort: failed to load module ${module_name}: ${error}`);
  }
  if (it == null)
    fail_with(`abort: the module ${module_name} does not export anything.`);

  // If no method name is provided, then use `main`
  const [method_name = "main"] = args;

  if (!it.hasOwnProperty(method_name))
    fail_with(
      `abort: the module ${module_name} has no exported member ${method_name}`
    );

  const method = it[method_name];

  if (typeof method !== "function")
    fail_with(`abort: expected ${module_name}.${method_name} to be a function`);

  const result = method();

  if (result instanceof rs.Subscription) {
    const updater = rstream_dot_updater(result);
    // without a notifier of changes, we just have to poll
    function step() {
      updater.go();
      setTimeout(step, 250);
    }
    step();
  }
})();
