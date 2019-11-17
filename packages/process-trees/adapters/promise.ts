// promise is like a special case of an async event stream that fires only once
//
// STDIN
// none
//
// STDOUT
// resolved value (one time)

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
import { INotify, INotifyMixin } from "@thi.ng/api";

// hack the prototype
INotifyMixin(Promise);

Promise.prototype["get_state_machine_spec"] = function() {
  return promise_state_machine;
};

// Note though that these only take effect if `then` or `catch` handlers are
// added.  So state is not accurate unless you can be sure that handlers were
// added.

const { then: _then } = Promise.prototype;
Promise.prototype.then = function then<T>(
  this: Promise<T> & INotify,
  ...args: any[]
) {
  this.notify({ id: "state", value: "done" });
  return _then.apply(this, args);
};

const { catch: _catch } = Promise.prototype;
Promise.prototype.catch = function<T>(
  this: Promise<T> & INotify,
  ...args: any[]
) {
  this.notify({ id: "state", value: "error" });
  return _catch.apply(this, args);
};

/* alt
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
