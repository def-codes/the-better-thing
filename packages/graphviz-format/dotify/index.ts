export * from "./dotify";
export * from "./protocols";

// Side-effect: default extensions for top of hierarchy.  The protocols are
// essentially unusable without these fallbacks, which allow you to traverse
// “through” ordinary values to others.
import { extend_Object } from "./internal/object";
extend_Object.dotify();
