import { ISubscribable } from "@thi.ng/rstream";
interface Process {
  // Distinguish read and write ports?
  port<T>(key: unknown): ISubscribable<T>;
}

// Can event bus be used to implement a discrete-event process model?
import { EventBus, valueUpdater } from "@thi.ng/interceptors";

export const make_process = () => {
  const process = new EventBus();
  process.addHandler(
    "inc",
    valueUpdater("counter", (x: number | undefined) => (x || 0) + 1)
  );
  return process;
};

window["incrementer"] = make_process();
