// REFLECT
//   - cannot reflect d3 because it returns an unannotated object
// REIFY:
//   - see meld demo.  I've done this several times over
//   - same goes for forces, which can be considered a different kind of thing
// CREATES:
//   - as *I* use it, this just creates a stateful thing with a tick command
//     - i.e. the sim is pull-based & doesn't have its own timer
//   - takes other messages, like add/remove node/force (hasNode/hasForce)
import { ISubsystemAdapter } from "./api";
import * as d3_force from "d3-force";

export interface ForceSimulationBlueprint {
  // it has other properties, but doesn't need any to construct
}

export const force_simulation_adapter: ISubsystemAdapter<ForceSimulationBlueprint> = {
  // See also modeling/force/forces
  type_iri: "https://github.com/d3/d3-force#ForceSimulation",
  can_create_contingent_processes: false,
  reify(blueprint) {
    const sim = d3_force.forceSimulation();
    // processify... yeah except that's what we're doing here
    return {};
  },
};
