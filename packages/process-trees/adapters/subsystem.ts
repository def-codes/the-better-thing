// a subsystem is a scope, a namespace within another subsystem (or the root system)
// it can be "responsible for" spawning more things
import { ISystemCalls } from "./api";

// Only the system should have access to this
// Which is generally true for reference types
// this should be an abstract class?
export class Subsystem {
  constructor(readonly system: ISystemCalls) {}

  // Invoked by the system when a process should cease all operations
  // Should this then be on a Process class inherited by Subsystem?
  // common implementation would be that it signals death...
  // but if the system knows already (because it called...)
  die() {}
}
