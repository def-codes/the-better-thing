import { reify_polymethod } from "./internal/polymethods";
import { IProcess, ISystemCalls } from "../adapters/api";

export const reify = (description: any, system: ISystemCalls): IProcess => {
  const reified = reify_polymethod(description, system);

  // There's in fact no special processing beyond what the polymethod does in this case

  return reified;
};
