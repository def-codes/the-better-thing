import { ProcessTree } from "@def.codes/process-trees";
// TEMP: don't actually depend on this (if possible)
import * as rs from "@thi.ng/rstream";
// eh, but prob going to need channels to debounce messages

type MessageFor<T extends string, More = {}> = Readonly<
  More & {
    type: T;
    path: readonly string[];
  }
>;

interface MessageTypes {
  value: { value: any };
  children: { names: readonly string[] };
}

type ProcessSinkMessage<K = keyof MessageTypes> = K extends keyof MessageTypes
  ? MessageFor<K, MessageTypes[K]>
  : never;

interface ProcessSink extends rs.ISubscribableSubscriber<ProcessSinkMessage> {}

interface ProcessObserverStream extends rs.Stream<ProcessSinkMessage> {}

// i.e. stream from process tree
const observer = (node: ProcessTree): ProcessObserverStream =>
  rs.stream<ProcessSinkMessage>(sub => {
    const path = node.path();

    // Is there a more idiomatic way to do this kind of forwarding?

    const children_watcher = node.children.subscribe({
      next(children) {
        sub.next({ type: "children", path, names: Object.keys(children) });
      },
    });

    const source_watcher = node.source.subscribe({
      next(value) {
        sub.next({ type: "value", path, value });
      },
    });

    // const child_watchers = () => {
    //   //
    // };

    return () => {
      children_watcher.unsubscribe();
      source_watcher.unsubscribe();
    };
  });

//////////////////////////// 1st draft
const observer0 = (node: ProcessTree, sink: ProcessSink) => {
  const path = node.path();
  const children_watcher = node.children.subscribe({
    next(children) {
      sink.next({ type: "children", path, names: Object.keys(children) });
    },
  });

  const source_watcher = node.source.subscribe({
    next(value) {
      sink.next({ type: "value", path, value });
    },
  });

  return {
    kill() {
      children_watcher.unsubscribe();
      source_watcher.unsubscribe();
    },
  };
};
//////////////////////////////////////////

export const observe_system = (system: ProcessTree): ProcessObserverStream => {
  // const sink = rs.subscription<ProcessSinkMessage, ProcessSinkMessage>();
  return observer(system);
};

// console.log(
//   `CHILDREN of ${node.path()}: ${[...children.keys()].join(", ")}`
// );
// console.log(`VALUE of ${node.path()}: ${JSON.stringify(value)}`);
