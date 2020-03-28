// import { register_console } from "./console-view";
import * as hdom from "@thi.ng/hdom";
import { MIND_MAP } from "./mind-map";
import { RULES } from "./rules";
import { make_renderer } from "@def.codes/polymorphic-hdom";
import { show_example } from "./show-example";

// Cool, how do protocols get registered?
const protocol_registry = {};

const NO_OP = () => null;

const fun_proxy = (target: object) => {
  const method = (...args) => {
    // console.log(`I was invoked with`, ...args);
  };
  return new Proxy(method, {
    apply(target, args) {
      console.log(`APPLIED to args`, args);
    },
    // Per below, we can think of this as a protocol implementation test
    has: (target, protocol) => {
      return true;
      //      return [target, "implements", protocol];
      // Does target implement protocol?
    },
    // Fires when a callback tries to access a member of the provided context,
    // including destructuring.
    //
    // Should return something late-binding.  Doesn't have to be evaluated now.
    get(target, protocol, receiver) {
      // If the object happens to have a member by this name already.
      // This is for built-in's, currently just "show" (but this could be in any eval context)
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
  // register_console();
  const ctx = fun_proxy(make_renderer(RULES.queries, RULES.interpreters));
  // @ts-ignore

  const { show } = ctx;
  // @ts-ignore
  protocol_registry.show = show;

  // hdom.renderOnce(() => [show, MIND_MAP["@graph"]], { root: "mind-map", ctx });
  show_example(window.location.search.replace(/^\?/, ""));
}

main();
