// We have to keep a registry of the multimethods so that their hierarchies can
// be updated.
import { MultiFnBase } from "@thi.ng/defmulti";
export const polymethod_registry = new Set<MultiFnBase<any>>();
