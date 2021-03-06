// doen't clean up after itself
import * as os from "os";
import * as path from "path";
import { writeFileSync, mkdtempSync } from "fs";

export function make_image_polling_viewer(
  image_name: string,
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
let fit = false;
function update() {
  img.src = image_file + '#' + new Date().getTime();
  const set_fit = () => {
    img.style.maxHeight = fit ? "100vh" : "";
    img.style.maxWidth = fit ? "100vw" : "";
  }
  img.style.cssText = "display: block;";
  set_fit();
  img.onclick = () => { fit = !fit; set_fit() };
  setTimeout(update, 1000);
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
