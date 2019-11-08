const { fileURLToPath, pathToFileURL } = require("url");
const rsd = require("@thi.ng/rstream-dot");
const {
  shell_open,
  shell_command,
} = require("@def.codes/node-web-presentation");
const { make_image_polling_viewer } = require("./viewer");

const dot_to_svg_file = (dot, file) =>
  shell_command("dot", ["-Tsvg", "-o", file], dot);

const exists = x => x != null;

function rstream_dot_updater(root, image_name = "dataflow.svg") {
  const { html_file, image_file } = make_image_polling_viewer(image_name);
  // See note in fn, hash and query are dropped on Windows.  not sure if that's fixable
  shell_open(pathToFileURL(html_file) + "#" + encodeURIComponent(image_name));

  return {
    go: (...nodes) =>
      dot_to_svg_file(
        rsd.toDot(rsd.walk([root, ...nodes].filter(exists))),
        image_file
      ),
  };
}

module.exports = { rstream_dot_updater };
