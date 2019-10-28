// Extend the global console interface to include the added properties.
declare global {
  interface Console {
    source: import("./api").ConsoleSource;
    orig: import("./api").PreservedConsole;
  }
}

export * from "./api";
export * from "./hijack-console";
