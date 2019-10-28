/** Compile-time helper to ensure that all tagged union cases are covered. */
// c/o Ryan Cavanaugh https://stackoverflow.com/a/39419171
export function assert_unreachable(_: never, name?: string): never {
  if (name) {
    throw new Error(`Unrecognized ${name}: ${JSON.stringify(_)}.`);
  }

  throw new Error(`Assert failed: unreachable code reached.`);
}
