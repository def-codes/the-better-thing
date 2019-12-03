import { module_host } from "./module-host";

// entrypoint from environment
export function main(
  args: readonly string[],
  environment: Readonly<Record<string, string>>
): void {
  console.log(`args`, args);
  console.log(`environment`, environment);
  const [module_name, op = "exports"] = args;
  module_host(module_name, op);
}
