import { module_host } from "./module-host";

// entrypoint from environment
export function main(
  args: readonly string[],
  environment: Readonly<Record<string, string>>,
  state: object = {}
): void {
  console.log(`args`, args);
  console.log(`environment`, environment);
  console.log(`state`, state);

  // Assume for now that we're in the business of interpreting a module file.
  const [module_name, op = "exports"] = args;
  module_host(module_name, op, state);
}
