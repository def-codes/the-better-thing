export * from "./loader";

import { make_loader } from "./loader";

function main() {
  Object.assign(window, make_loader());
}

main();
