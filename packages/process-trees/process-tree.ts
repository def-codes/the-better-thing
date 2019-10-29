import {
  subscription,
  ISubscribable,
  ISubscriber,
  ISubscribableSubscriber,
  Subscription,
} from "@thi.ng/rstream";
import { Transducer } from "@thi.ng/transducers";
import { equivObject } from "@thi.ng/equiv";
import { ProcessTreeSpec, ProcessTree, ProcessMapping } from "./api";
import { LazyCall } from "./lazy-call";

function* iterate_to_root(node: ProcessTree) {
  while (node.location) {
    yield node.location;
    node = node.location.parent;
  }
}

/** Constructor for a process tree starting at this node.  Taking the current
 * value of the stream as its state, describe a collection of named child
 * processes based (deterministically) on that state.  The spec cannot change
 * for the lifetime of this instance. */
export const make_process_tree = <A, B>(
  spec: ProcessTreeSpec<A, B>,
  // Pretend for now this is always provided
  // why can't this just be ISubscriber?
  resolve: (path: string) => ISubscribableSubscriber<any> = () =>
    subscription(),
  location: ProcessTree["location"] | null = null
): ProcessTree<A, B> => {
  const { process } = spec;
  const children = new Map<string, ProcessTree>();
  const children_sub = subscription<typeof children, typeof children>();
  const state = { children };

  const path = () => [...iterate_to_root(this_node)].map(_ => _.key).reverse();

  const equals = (spec1: ProcessTreeSpec, spec2: ProcessTreeSpec) =>
    spec1 &&
    spec2 &&
    equivObject(spec1.source, spec2.source) &&
    spec1.process === spec2.process;
  const spawn = (key, spec) => {
    // console.log("CREATE", key);
    state.children.set(
      key,
      make_process_tree(spec, resolve, { parent: this_node, key })
    );
  };
  const kill = key => {
    // console.log("KILL", key);
    const child = state.children.get(key);
    if (child) child.die();
    state.children.delete(key);
  };
  const update = (key, spec) => {
    // console.log(`UPDATE`, key, "with", spec);
    const child = state.children.get(key);
    if (child && !equals(spec, child.spec)) {
      kill(key);
      spawn(key, spec);
    }
  };
  const subscriber = {
    error(error) {
      console.log(`FAIL`, path().join("/"), error);
    },
    done() {
      // TODO: add property to spec for end-of-input process
      console.log(`DONE`, path().join("/"));
    },
    next: !process
      ? undefined
      : value => {
          const child_descs = process(value);

          // Kill children no longer in spec
          for (const key of state.children.keys())
            if (!Object.prototype.hasOwnProperty.call(child_descs, key))
              kill(key);

          // Create or update children in new spec
          for (const [key, spec] of Object.entries(child_descs))
            (state.children.has(key) ? update : spawn)(key, spec);

          // Should be done only if there were actual changes
          // Duplicating because otherwise it's identical each time...
          children_sub.next(new Map(state.children.entries()));
        },
  };

  const base =
    typeof spec.source === "string"
      ? (resolve(spec.source) as ISubscribable<A>)
      : spec.source.fn(...spec.source.args);
  const transform = spec.xform && spec.xform.fn(...spec.xform.args);

  // Admirably, this infers as Subscription<A, B> | Subscription<A, A>
  // but see below
  const source = transform
    ? base.subscribe(subscriber, transform)
    : // prettier-ignore
      // @ts-ignore
      base.subscribe(subscriber) as Subscription<A, B>;

  const target = spec.output
    ? source.subscribe(resolve(spec.output))
    : undefined;

  const this_node = {
    spec,
    location,
    source,
    target,
    children: children_sub,
    path,
    die() {
      // console.log(`you're killing me!`, path().join("/"));
      if (source) source.unsubscribe();
      for (const key of state.children.keys()) kill(key);
    },
  };

  // @ts-ignore TEMP: see note above, how to tell it that B = A when xform is null?
  // Also, when using resolver you just can't know
  return this_node;
};

// helper function for typed nodes, mainly for matching T in source and process
export const proc = <T>(
  source: string | LazyCall<ISubscribable<T>>,
  process?: ProcessMapping<T>
): ProcessTreeSpec<T> => ({ source, process });

export const in_out = <T>(
  source: LazyCall<ISubscribable<T>>,
  output: string
): ProcessTreeSpec<T> => ({ source, output });

export const in_x_out = <T, U>(
  source: string | LazyCall<ISubscribable<T>>,
  xform: LazyCall<Transducer<T, U>>,
  output: string
): ProcessTreeSpec<T, U> => ({ source, xform, output });
