// Do not publicly export this module.
import { polymethod } from "@def.codes/polymorphic-functions";

/** Singleton function serving as extension point for datafy protocol. */
export const datafy_polymethod = polymethod<any>();

/** Singleton function serving as extension point for nav protocol. */
export const nav_polymethod = polymethod<any, [any, any, any]>();
