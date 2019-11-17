// maybe this will be folded into something more basic (because it is built-in)
//
// promise is like a special case of an async event stream that fires only once
//
// STATE MACHINE
// Using terminology from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
import { StateMachineSpec } from "./state-machines";
export const promise_state_machine: StateMachineSpec = {
  states: {
    pending: {},
    done: { terminal: true },
    error: { terminal: true },
  },
  transitions: [
    ["pending", "fulfill", "done"],
    ["pending", "reject", "error"],
  ],
  initial_state: "pending",
};
/////

// REIFY
//
// There's no meaningful application of “reify” to Promise *per se*.  You can
// think of it as an abstract base class.  Yet if we do want to use promises in
// a visible way, we need information from instances that is not available in
// the native mechanism.  You can't tell from a Promise whether or not it's been
// settled.
//
// Wow, you can actually hack the prototype
import { INotify, INotifyMixin } from "@thi.ng/api";

// @ts-ignore Yeah well it does now
// Promise.prototype.notify = function notify(...args) {
//   console.log("NOTIFY!", ...args);
// };

INotifyMixin(Promise);

const old_then = Promise.prototype.then;
Promise.prototype.then = function then<T>(
  this: Promise<T> & INotify,
  ...args: any[]
) {
  // console.error("DONE!", ...args);
  this.notify({ id: "state", value: "done" });
  return old_then.apply(this, args);
};

const old_catch = Promise.prototype.catch;
Promise.prototype.catch = function<T>(
  this: Promise<T> & INotify,
  ...args: any[]
) {
  // console.error("CAUGHT!", ...args);
  this.notify({ id: "state", value: "error" });
  return old_catch.apply(this, args);
};

/* alt
const { then: _then, catch: _catch } = Promise.prototype;
Object.assign(Promise.prototype, {
  then<T>(this: Promise<T>, args: any[]) {
    // hook
    return _then.apply(this, args);
  },
  catch<T>(this: Promise<T>, args: any[]) {
    // hook
    return _catch.apply(this, args);
  },
});
*/

// REFLECT
import { datafy_protocol } from "@def.codes/datafy-nav";
datafy_protocol.extend(Promise, instance => {
  //
});
/////
