import { register_console } from "./console-view";
import { show_example } from "./show-example";
import { show_mind_map } from "./show-mind-map";

export function main() {
  register_console();
  // what's the (top-level) subject?
  // the system, or a model?
  //
  // if the top-level topic is handled by giving it to the system
  // then "system" as the top-level topic necessitates reflection
  // meaning we must reify the System
  //
  // A reification spree
  //
  //
  // Here, we interpret the window location
  //
  // We must reify Interpreter.
  //
  //     meld:Interpreter a owl:Class
  //
  //

  // TURN THIS INTO A STREAM
  // MAKE A SYSTEM
  // FEED THIS TO THE SYSTEM

  const requested_model = window.location.search.replace(/^\?/, "");
  if (requested_model) show_example(requested_model);
  else {
    show_mind_map();
  }
}

main();
