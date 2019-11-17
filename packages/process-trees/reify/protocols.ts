import { reify_polymethod } from "./internal/polymethods";

/** Singleton extension point for reify protocol. */
export const reify_protocol = { extend: reify_polymethod.extend };
