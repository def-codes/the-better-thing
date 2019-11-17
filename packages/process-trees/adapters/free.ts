// LABEL: general subsystem
//
// COMMENT:
// A freeform subsytem.  That is not responsible for anything but creating other
// processes.

import { ISubsystemAdapter } from "./api";

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

export const free_adapter: ISubsystemAdapter<FreeBlueprint> = {
  type_iri: "def.codes/meld/subsystem/FreeSubsystem",
  // ENTAILS
  // - whatever it says
  can_create_contingent_processes: true,
  reify(blueprint) {
    return {
      dispose() {},
      receive_message(message: AssertChildProcessMessage) {
        if (message.type === "assertChildProcess") {
          const {} = message;
        }
      },
    };
  },
};
