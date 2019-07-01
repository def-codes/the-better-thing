import { register_console } from "./console-view";
import { show_all_examples } from "./show-all-examples";
import { show_example } from "./show-example";

export function main() {
  register_console();
  const requested_model = window.location.search.replace(/^\?/, "");
  if (requested_model) show_example(requested_model);
  else show_all_examples();
}

main();