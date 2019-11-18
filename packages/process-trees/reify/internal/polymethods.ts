// Do not publicly export this module.
import { IProcess } from "../../adapters/api";
import { polymethod } from "@def.codes/polymorphic-functions";
import { ISystemCalls } from "../../adapters/api";

/** Singleton function serving as extension point for reify protocol. */
export const reify_polymethod = polymethod<IProcess, [ISystemCalls, object]>();
