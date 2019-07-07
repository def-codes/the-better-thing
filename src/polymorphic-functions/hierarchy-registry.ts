import { polymethod_registry } from "./polymethod-registry";

export const register_relationship = (
  child: PropertyKey,
  parent: PropertyKey
) => {
  // Update the hierarchies of all registered polymethods
  //
  // TODO: you'll have to retrofit pm's with all this when *they* are added,
  // too
  polymethod_registry.forEach(_ => _.isa(child, parent));
};
