import { reify_polymethod } from "./internal/polymethods";
import { IProcess, ISystemCalls } from "../adapters/api";

export const reify = (system: ISystemCalls, description: any): IProcess => {
  const reified = reify_polymethod(system, description);

  // There's in fact no special processing beyond what the polymethod does in this case

  return reified;
};
