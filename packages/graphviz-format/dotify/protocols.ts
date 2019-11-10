import { dotify_polymethod } from "./internal/polymethods";

/** Singleton extension point for dotify protocol. */
export const dotify_protocol = { extend: dotify_polymethod.extend };
