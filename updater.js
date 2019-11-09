const { fileURLToPath, pathToFileURL } = require("url");
const {
  shell_open,
  shell_command,
} = require("@def.codes/node-web-presentation");
const { make_image_polling_viewer } = require("./viewer");

const dot_to_svg_file = (dot, file) =>
  shell_command("dot", ["-Tsvg", "-o", file], dot);

function variable_rstream_dot_updater() {
  const image_name = "dataflow.svg";
  const { html_file, image_file } = make_image_polling_viewer(image_name);
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
