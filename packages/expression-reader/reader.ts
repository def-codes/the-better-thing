import { with_scanner } from "./scanner";

export const read = (code: string) =>
  with_scanner(new Function("world", `with (world) { ${code} }`));
