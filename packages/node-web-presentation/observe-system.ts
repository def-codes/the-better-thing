import {
  ProcessTree,
  ProcessTreeSpec,
  LazyCall,
} from "@def.codes/process-trees";
// TEMP: don't actually depend on this (if possible)
import * as rs from "@thi.ng/rstream";
import { map_object, dictionary_from } from "@def.codes/helpers";
// eh, but prob going to need channels to debounce messages

const stringify_function = (fn: Function) => fn.name || fn.toString();

// jsonify
const datafy_binding = ({ fn, args }: LazyCall<any>) => ({
  fn: stringify_function(fn),
  args,
});

const datafy_spec = ({ source, xform, process }: ProcessTreeSpec) => ({
  source: typeof source === "string" ? source : datafy_binding(source),
  ...(xform ? { xform: datafy_binding(xform) } : {}),
  ...(process ? { process: stringify_function(process) } : {}),
});

type MessageFor<T extends string, More = {}> = Readonly<
  More & {
    type: T;
    path: readonly string[];
  }
>;

interface MessageTypes {
  value: { value: any };
  // children: { names: readonly string[] };
  // value is "datafied" process tree spec
  children: { specs: Record<string, object> };
}

type ProcessSinkMessage<K = keyof MessageTypes> = K extends keyof MessageTypes
  ? MessageFor<K, MessageTypes[K]>
  : never;

interface ProcessSink extends rs.ISubscribableSubscriber<ProcessSinkMessage> {}

interface ProcessObserverStream extends rs.Stream<ProcessSinkMessage> {}

// i.e. stream from process tree
export const observer_of = (node: ProcessTree): ProcessObserverStream =>
  rs.stream<ProcessSinkMessage>(sub => {
    const path = node.path();

    // Is there a more idiomatic way to do this kind of forwarding?

    const children_watcher = node.children.subscribe({
      next(children) {
        // Why is a map used for children, anyway?
        // Could get the specs from the values... but can we print them?
        sub.next({
          type: "children",
          path,
          specs: dictionary_from(children.keys(), name =>
            datafy_spec(children.get(name).spec)
          ),
        });
      },
    });

    const source_watcher = node.source.subscribe({
      next(value) {
        sub.next({ type: "value", path, value });
      },
    });

    return () => {
      children_watcher.unsubscribe();
      source_watcher.unsubscribe();
    };
  });
