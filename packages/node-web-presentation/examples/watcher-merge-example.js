const rs = require("@thi.ng/rstream");
const tx = require("@thi.ng/transducers");
const { filesystem_watcher_source } = require("@def.codes/process-trees");

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

function main() {
  const root = rs.merge();

  const thisdir = rs.stream(
    filesystem_watcher_source(".", { recursive: true, persistent: false })
  );

  const node_modules = rs.stream(
    filesystem_watcher_source("../../../node_modules", {
      recursive: true,
      persistent: false,
    })
  );

  async function go() {
    await timeout(1000);
    root.add(node_modules);
    await timeout(1000);
    root.add(thisdir);
    await timeout(1000);

    root
      .transform(tx.map(_ => `${_.context}/${_.path}`))
      .subscribe(rs.trace("FULLPATH"));
    thisdir;
    // await timeout(15000);
  }

  go();
  return [root, thisdir, node_modules];
}

module.exports = { main };
