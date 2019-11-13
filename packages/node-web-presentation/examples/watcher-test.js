const rs = require("@thi.ng/rstream");
const { filesystem_watcher_source } = require("@def.codes/process-trees");

rs.stream(
  filesystem_watcher_source(".", { recursive: true, persistent: false })
).subscribe(rs.trace("WATCH ME"));
(async function() {
  await new Promise(resolve => setTimeout(resolve, 10000));
})();
