// LABEL: general subsystem
//
// COMMENT:
// A freeform subsytem.  That is not responsible for anything but creating other
// processes.

import { ISubsystemAdapter } from "./api";

const FREE_SUBSYSTEM_TYPE_IRI = "def.codes/meld/subsystem/FreeSubsystem";

interface FreeBlueprint {}

interface AssertChildProcessMessage {
  type: "assertChildProcess";
  name: string;
  // A description of the process that should exist at the given name
  description: object;
}

// see notes on collection process
interface What {
  type: "what";
}

// REIFY:
//   - see meld demo.  I've done this several times over
//   - same goes for forces, which is a different kind of thing
import { reify_protocol } from "../reify/index";
reify_protocol.extend(
  FREE_SUBSYSTEM_TYPE_IRI,
  (description: FreeBlueprint, system) => {
    return {
      dispose() {},
      receive_message(message: AssertChildProcessMessage) {
        if (message.type === "assertChildProcess") {
          const {} = message;
        }
      },
    };
  }
);
/////

export const free_adapter: ISubsystemAdapter<FreeBlueprint> = {
  type_iri: FREE_SUBSYSTEM_TYPE_IRI,
  // ENTAILS
  // - whatever it says
  can_create_contingent_processes: true,
};
