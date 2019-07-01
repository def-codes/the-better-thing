import { register_driver } from "./system";

// TEMP: register all drivers now
import * as drivers from "./drivers/index";
for (const [_, { name, init }] of Object.entries(drivers)) {
  register_driver(name, init);
}

// KEEP SORTED
// Not currently imported anywhere
// export * from "./system";
export * from "./rdf-hdom";
export * from "./system";
export * from "./value-view";
export * from "./world";