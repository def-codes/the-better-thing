// doen't clean up after itself
const {
  shell_open,
  shell_command,
} = require("@def.codes/node-web-presentation");
const os = require("os");
const path = require("path");
const { existsSync, writeFileSync, mkdtempSync } = require("fs");

const dot_to_svg_file = (dot, file) =>
  shell_command("dot", ["-Tsvg", "-o", file], dot);

function make_polling_viewer(
  image_name,
  dir = mkdtempSync(`${os.tmpdir()}${path.sep}polling-viewer`)
) {
  const html_file = path.join(dir, "polling-viewer.html");
  writeFileSync(
    html_file,
    `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><title>polling viewer</title></head>
<body>
<script>
const img = document.createElement("img");
document.body.appendChild(img);
// I'd like to do this but (on Windows at least) query and hash are dropped in shell open
// const image_file = decodeURIComponent(location.search.slice(1));
const image_file = "${image_name}";
function update() {
  img.src = image_file + '#' + new Date().getTime();
  setTimeout(update, 250);
}
update();
</script>
</body>
</html>
`
  );

  const image_file = path.join(dir, image_name);
  return { html_file, image_file };
}

const { fileURLToPath, pathToFileURL } = require("url");

function variable_rstream_dot_updater() {
  const image_name = "dataflow.svg";
  const { html_file, image_file } = make_polling_viewer(image_name);
  // See note above, hash and query are dropped on Windows.  not sure if that's fixable
  shell_open(pathToFileURL(html_file) + "#" + encodeURIComponent(image_name));

  const rsd = require("@thi.ng/rstream-dot");
  const rs = require("@thi.ng/rstream");
  const tx = require("@thi.ng/transducers");
  const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));
  let last = rs.fromInterval(1000);
  const root = last;
  async function do_rstream_dot() {
    for (let n = 0; n < 10; n++) {
      last = last.subscribe(tx.map(x => x * 2));
      const dot = rsd.toDot(rsd.walk([root]));
      await dot_to_svg_file(dot, image_file);
      await timeout(500);
    }
  }
  do_rstream_dot();
}
variable_rstream_dot_updater();
