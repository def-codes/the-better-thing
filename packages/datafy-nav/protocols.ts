import { datafy_polymethod, nav_polymethod } from "./internal/polymethods";

/** Singleton extension point for nav protocol. */
export const nav_protocol = { extend: nav_polymethod.extend };

/** Singleton extension point for datafy protocol. */
export const datafy_protocol = { extend: datafy_polymethod.extend };
