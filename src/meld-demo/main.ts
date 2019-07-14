import { register_console } from "./console-view";
import * as hdom from "@thi.ng/hdom";
// import { show_example } from "./show-example";
// import { show_mind_map } from "./show-mind-map";
import { MIND_MAP } from "./mind-map";
import { RULES } from "./rules";
import { make_renderer } from "@def.codes/polymorphic-hdom";

export function main() {
  register_console();

  const show = make_renderer(RULES.queries, RULES.interpreters);
  hdom.renderOnce(() => [show, MIND_MAP["@graph"]], {
    root: "mind-map",
    ctx: { show },
  });

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

  /*
  const requested_model = window.location.search.replace(/^\?/, "");
  if (requested_model) show_example(requested_model);
  else {
    show_mind_map();
  }*/
}

main();
