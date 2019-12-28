import {
  subscription,
  ISubscribable,
  ISubscribableSubscriber,
  Subscription,
} from "@thi.ng/rstream";
import { equivObject } from "@thi.ng/equiv";
import { ProcessTreeSpec, ProcessTree } from "./api";

function* iterate_to_root(location: ProcessTree["location"]) {
  while (location) {
    yield location;
    // @ts-ignore
    location = location.parent;
  }
}

const equals = (spec1: ProcessTreeSpec, spec2: ProcessTreeSpec) =>
  spec1 &&
  spec2 &&
  equivObject(spec1.source, spec2.source) &&
  spec1.process === spec2.process;

/** Constructor for a process tree starting at this node.  Taking the current
 * value of the stream as its state, describe a collection of named child
 * processes based (deterministically) on that state.  The spec cannot change
 * for the lifetime of this instance. */
export const make_process_tree = <A, B>(
  spec: ProcessTreeSpec<A, B>,
  // Pretend for now this is always provided
  resolve: (path: string) => ISubscribableSubscriber<any> = () =>
    subscription(),
  location: ProcessTree["location"] | null = null
): ProcessTree<A, B> => {
  const { process, source, xform, forward_to } = spec;
  const children = new Map<string, ProcessTree>();
  const children_sub = subscription<typeof children, typeof children>();
  const state = { children };

  const path = () => [...iterate_to_root(location)].map(_ => _.key).reverse();

  const spawn = (key: string, spec: ProcessTreeSpec) => {
    // console.log("CREATE", key);
    state.children.set(
      key,
      make_process_tree(
        spec,
        id =>
          // Yeah yeah, real dicey.  Make "." as source resolve to this node
          id === "."
            ? (output_sub as ISubscribableSubscriber<any>)
            : resolve(id),
        { parent: this_node, key }
      )
    );
  };

  const kill = (key: string) => {
    // console.log("KILL", key);
    state.children.get(key)?.die();
    state.children.delete(key);
  };

  const update = (key: string, spec: ProcessTreeSpec) => {
    console.log(`UPDATE`, key, "with", spec);
    const child = state.children.get(key);
    if (child && !equals(spec, child.spec)) {
      kill(key);
      spawn(key, spec);
    }
  };

  const base =
    typeof source === "string"
      ? (resolve(source) as ISubscribable<A>)
      : source.fn(...source.args);

  // Admirably, this infers as Subscription<A, B> | Subscription<A, A>
  // but how to tell it that B = A when xform is null?
  const output_sub = xform
    ? base.subscribe(xform?.fn(...xform.args), { id: "/" + path().join("/") })
    : ((<unknown>base) as Subscription<A, B>);

  const forward_sub = forward_to && output_sub.subscribe(resolve(forward_to));

  const this_node: ProcessTree<A, B> = {
    spec,
    location,
    output: output_sub,
    children: children_sub,
    path,
    die() {
      console.log(`you're killing me!`, path().join("/"));
      output_sub?.unsubscribe();
      spawn_sub?.unsubscribe();
      forward_sub?.unsubscribe();
      for (const key of state.children.keys()) kill(key);
    },
  };

  const spawn_sub =
    process &&
    output_sub.subscribe({
      error(error) {
        console.error(`FAIL`, path().join("/"), error);
      },
      done() {
        // TODO: add property to spec for end-of-input process
        // BUT it wouldn't be here.
        console.log(`DONE`, path().join("/"));
      },
      next: value => {
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
    });

  return this_node;
};
