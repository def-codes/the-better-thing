import { register_console } from "./console-view";
import * as hdom from "@thi.ng/hdom";
// import { show_example } from "./show-example";
// import { show_mind_map } from "./show-mind-map";
import { MIND_MAP } from "./mind-map";
import { RULES } from "./rules";
import { make_renderer } from "@def.codes/polymorphic-hdom";

const NO_OP = () => null;

const fun_proxy = (target: object) => {
  const method = (...args) => {
    console.log(`I was invoked with`, ...args);
  };
  return new Proxy(method, {
    has: () => true,
    get(target, protocol, receiver) {
      // If this fires, it's because a callback accessed a member of the
      // provided context during the interpretration of a trait.
      //
      // The intended semantic is that protocols (in a blessed or otherwise
      // default namespace) can be referenced by extraction of a term from a
      // callback context.
      //
      // Determine whether the target implements the protocol.
      //
      // If not, do nothing.
      //
      // If so, dereference the protocol from the global registry using the
      // now-available local name.
      //
      // Lower-level test - use instanceof (avail in proxy)?
      if (!(protocol in target)) {
        // Unless I had a global protocol registry, I couldn't say from
        // `protocol`whether or not it represented a protocol, or have a way to
        // determine whether I implement it.

        // How could you specify a fallback behavior here?
        // console.log(`target does not implement protocol`, target, protocol);
        return NO_OP;
      }
      // But that's not how it really works.
      //
      // First, our polymorphic dispatch doesn't actually tell you what it was
      // triggered by, and doesn't require that protocol extenders advertise
      // their extension of the protocol in a queryable way.
      //
      // Second, they don't know their names.

      // return `and what if I knew how to interpret ‘${String(
      //   protocol
      // )}’, what could you do for me?`;
      else return Reflect.get(target, protocol, receiver);
    },
  });
};

export function main() {
  register_console();

  const show = make_renderer(RULES.queries, RULES.interpreters);

  hdom.renderOnce(() => [show, MIND_MAP["@graph"]], {
    root: "mind-map",
    ctx: fun_proxy({ show }),
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
