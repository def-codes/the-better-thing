import { StreamSource, Stream } from "@thi.ng/rstream";

export const CONSOLE_METHODS = ["log", "warn", "error"] as const;

type ArrayItemType<A> = A extends readonly (infer E)[] ? E : never;

export type ConsoleMethodName = ArrayItemType<typeof CONSOLE_METHODS>;

export type ConsoleSource = StreamSource<HijackedConsoleMessage>;
export type ConsoleStream = Stream<HijackedConsoleMessage>;

export interface PreservedConsole
  extends Partial<Pick<Console, ConsoleMethodName>> {}

export interface HijackedConsoleMessage {
  method: ConsoleMethodName;
  args: readonly any[];
}
