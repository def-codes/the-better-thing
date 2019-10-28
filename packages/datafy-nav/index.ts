// KEEP SORTED
export * from "./api";
export * from "./built-ins";
export * from "./datafy";
export * from "./protocols";
export * from "./nav";

// Side-effect: default extensions for top of hierarchy.  The protocols are
// essentially unusable without these fallbacks, which allow you to traverse
// “through” ordinary values to other, possibly navigable ones.
//
// Clojure actually includes a default implementation for `null` as well, which
// I expect we'll need to add.
import { extend_Object } from "./internal/object";
extend_Object.datafy();
extend_Object.nav();
