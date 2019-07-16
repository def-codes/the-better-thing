import { register_console } from "./console-view";
import * as hdom from "@thi.ng/hdom";
// import { show_example } from "./show-example";
// import { show_mind_map } from "./show-mind-map";
import { MIND_MAP } from "./mind-map";
import { RULES } from "./rules";
import { make_renderer } from "@def.codes/polymorphic-hdom";

// Cool, how do protocols get registered?
const protocol_registry = {};

const NO_OP = () => null;

const fun_proxy = (target: object) => {
  const method = (...args) => {
    // console.log(`I was invoked with`, ...args);
  };
  return new Proxy(method, {
    // Per below, we can think of this as a protocol implementation test
    has: (target, key) => {
      return true;
    },
    // Fires when a callback tries to access a member of the provided context,
    // including destructuring.
    get(target, protocol, receiver) {
      // Lower-level test - use instanceof (avail in proxy)?
      // using in (`has`) as proxy for procol implementation
      //
      // Regardless, it should return something late-binding.
      // Doesn't have to be evaluated now.
      if (protocol in target) return Reflect.get(target, protocol, receiver);

      // If key is the local name of a registered protocol,
      if (protocol in protocol_registry) {
        console.log(`MATCH protocol`, protocol);

        // then invoke that protocol on this object
        // if the target has no implementations, no-op
        return (...args) => protocol_registry[protocol](target, ...args);
      }

      return NO_OP;
    },
  });
};

export function main() {
  register_console();
  const ctx = fun_proxy(make_renderer(RULES.queries, RULES.interpreters));
  // @ts-ignore

  const { show } = ctx;
  // @ts-ignore
  protocol_registry.show = show;

  hdom.renderOnce(() => [show, MIND_MAP["@graph"]], { root: "mind-map", ctx });

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
}

main();
