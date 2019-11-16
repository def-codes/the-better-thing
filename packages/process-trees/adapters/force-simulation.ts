// INVARIANTS?
// REFLECT
//   - cannot reflect d3 because it returns an unannotated object
// REIFY:
//   - see meld demo.  I've done this several times over
//   - same goes for forces, which can be considered a different kind of thing
// MESAAGING:
//   - tick (input port)
//     - unlike idiomatic d3 usage. this is pull-based & doesn't run its own timer
// ENTAILS:
//   - takes other messages, like add/remove node/force (hasNode/hasForce)
//     - nodes COLLECTION (state port)
//     - forces DICTIONARY (state port)
import { ISubsystemAdapter } from "./api";
import * as d3_force from "d3-force";

export interface ForceSimulationBlueprint {
  // it has other properties, but doesn't need any to construct
}

// STATE MACHINE
//

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
