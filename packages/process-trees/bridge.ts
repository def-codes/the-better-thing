// Bridge between representation and object construction
import { MintSpec } from "./minting";

interface SystemContext {
  //
}

interface SystemReference {
  //
}

// expectation? could be anything, but should at least implement some interface
export const to_stamp = (what: any): MintSpec => {
  return { type: "prototype", proto: {} };
};
