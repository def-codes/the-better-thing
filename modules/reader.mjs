import { make_scanner, normalize, EXPR } from "./expression-scanner.mjs";

const scan = code => {
  const contexts = [];
  new Function("world", `with (world) { ${code} }`)(make_scanner(contexts));
  return contexts;
};

export const read = userland_code => normalize(scan(userland_code));
