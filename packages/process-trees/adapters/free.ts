// A freeform subsytem.  That is not responsible for anything but creating other
// processes.
import { ISubsystemAdapter } from "./api";

interface FreeBlueprint {}

export const free_adapter: ISubsystemAdapter<FreeBlueprint> = {
  type_iri: "def.codes/meld/subsystem/FreeSubsystem",
  // ENTAILS
  // - whatever it says
  can_create_contingent_processes: true,
  reify(blueprint) {
    return {};
  },
};
