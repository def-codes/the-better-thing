// A freeform subsytem.  That is not responsible for anything but creating other
// processes.
import { ISubsystemAdapter } from "./api";

interface FreeBlueprint {}

export const free_adapter: ISubsystemAdapter<FreeBlueprint> = {
  can_create_contingent_processes: true,
  reify(blueprint) {
    return {};
  },
};
