// a day in the life of the system
import { ISystemCalls } from "./api";
import { Subsystem } from "./subsystem";

// container for “managing” a system of related processes
// Should not export this class directly?
export class System /* extends Subsystem */ {
  bind_system_calls(subsystem: Subsystem): ISystemCalls {
    return {
      spawn(name, description) {
        this.spawn(subsystem, name, description);
      },
    };
  }

  // a thing wants to have a baby.
  // chicken/egg here... this will be called on syscalls
  spawn(subsystem: Subsytem, name: string, description) {
    // now reify
    // construct special system calls bound to that instance
    // and register
  }

  // a thing had a baby (reflected process)
  thing_had_a_baby = () => {
    // which process?
    // what instance?
    // what name?
    // any additional description?
    // now unreify (datafy)
    // and register
  };

  // a thing wants to set up point-to-point communication
  thing_wants_point_to_point_communication = () => {
    // which process?
    // which source?
    // which target?
  };
}
