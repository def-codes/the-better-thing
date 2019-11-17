import { reify_polymethod } from "./internal/polymethods";
import { IProcess } from "../adapters/api";

export const reify = (description: any): IProcess => {
  const reified = reify_polymethod(description);

  // There's in fact no special processing beyond what the polymethod does in this case

  return reified;
};
