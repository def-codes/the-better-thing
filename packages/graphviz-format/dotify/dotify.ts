import { dotify_polymethod } from "./internal/polymethods";
import { Graph } from "../api";

export const dotify = (thing: any): Graph => {
  const dotified = dotify_polymethod(thing);

  // There's in fact no special processing beyond what the polymethod does in this case

  return dotified;
};
