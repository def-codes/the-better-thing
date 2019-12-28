// KEEP SORTED
export * from "./api";
export * from "./factory";
export * from "./identity-factory";

import { make_identity_factory } from "./identity-factory";
// TODO: get rid of this
export default make_identity_factory();
