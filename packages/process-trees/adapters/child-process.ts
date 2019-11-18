// LABEL: child process
//
// COMMENT: Wrap an OS process
//
// THESE are only for Node subprocesses, which should presumably have their own
// special type.
//
// MESSAGES:
// - message
//   - in: send
//   - out: message event
//
// STDIN:
// actual stdin
//
// STDOUT:
// actual stdout
//
import * as cp from "child_process";

// Hmm, child_process doesn't export ChildProcess *per se*
const blah = cp.exec("ls");
const ChildProcess: cp.ChildProcess = Object.getPrototypeOf(blah).constructor;

const TYPE_IRI = "http://def.codes/meld/ChildProcess";

interface ChildProcessBlueprint {
  readonly command: string;
  readonly args: readonly string[];
}

interface ChildProcessDescription extends ChildProcessBlueprint {
  "@type": typeof TYPE_IRI;
}

// REIFY
import { reify_protocol } from "../reify/index";
reify_protocol.extend(TYPE_IRI, (description: ChildProcessBlueprint) => {
  // spawn? exce? fork?
  return {};
});
/////

// REFLECT
import { datafy_protocol } from "@def.codes/datafy-nav";
datafy_protocol.extend(
  ChildProcess,
  (instance): ChildProcessDescription => {
    return {
      "@type": TYPE_IRI,
      // I don't see that you can get these from the instance
      command: "", //instance,
      args: [], // instance,
    };
  }
);
/////
