// Do not publicly export this module.
import { Graph } from "../../api";
import { polymethod } from "@def.codes/polymorphic-functions";

/** Singleton function serving as extension point for dotify protocol. */
export const dotify_polymethod = polymethod<Graph>();
