import { subscription } from "@thi.ng/rstream";
import {
  LiveRequireFunction,
  DependencyDescription,
  DefinitionDescription,
} from "./api";

// function require(module_id) {
//   // but how do we know what module the require is coming from?
//   required.next({ dependency, module_id });
// }

// should this have a base directory?
export const live_require: LiveRequireFunction = module_id => {
  const defined = subscription<DefinitionDescription, DefinitionDescription>();
  const required = subscription<DependencyDescription, DependencyDescription>();

  return {
    define(module_id, code) {
      const exports = {}; // get_it(module_id, code);
      defined.next({ module_id, exports });
    },
    defined,
    required,
  };
};
