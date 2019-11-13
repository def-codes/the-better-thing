// MultiWave:
// - a composite thing
// - uses interceptor bus
//   - with pretty strong types
// - has some internal state
// - has rather custom internal mechanics
// - mostly serves as a set of ports
// - definitely a subsystem
//   - creates contingent processes
//     - though currently doesn't have cleanup
// ENTAILS:
// - dynamic port map
import { ISubsystemAdapter } from "./api";

export interface MultiWaveBlueprint {
  address: string;
}

export const multiwave_adapter: ISubsystemAdapter<MultiWaveBlueprint> = {
  type_iri: "http://morningstarcorp.com/interop/models/MultiWave",
  // in its capacity as a... port map
  can_create_contingent_processes: true,
  reify(blueprint) {
    // make instance, etc
    // get_instance_for_host(blueprint.address)
    return {};
  },
};
