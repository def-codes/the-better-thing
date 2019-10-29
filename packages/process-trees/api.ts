import * as rs from "@thi.ng/rstream";
import * as tx from "@thi.ng/transducers";
import { LazyCall } from "./lazy-call";

// TS: We don't really intend `undefined` to be allowed for defined keys, but in
// cases where a function's return type *should* be the union of different
// dictionaries, the keys end up being undefined in the resulting type, i.e.
//
//     return x ? { a: T } : { b: U }
//
// yields
//
//     { a?: T, b?: U }
//
// rather than
//
//     { a: T } | { b: U }
interface ProcessChildrenSpec {
  [key: string]: ProcessTreeSpec | undefined;
}

export type ProcessMapping<T = unknown> = (value: T) => ProcessChildrenSpec;

// May need an invariant context threaded throughout.
// Is the root a first-class thing throughout tree, or are all relative?

interface IProcess {
  // End the process and clean up any related resources.
  // If there are child processes, also tear down those processes
  die(): void;
}

// type TransducerDescription<A, B>

/** Describe a mapping between a process and a set of child processes. */
export interface ProcessTreeSpec<A = unknown, B = A> {
  // Describe the source
  readonly source: string | LazyCall<rs.ISubscribable<A>>;

  // Describe an optional transform
  readonly xform?: LazyCall<tx.Transducer<A, B>>;

  // Optionally identify an output node
  readonly output?: string;

  /** Describe the child processes for a given node state. */
  readonly process?: ProcessMapping<B>;

  readonly comment?: string;
}

/** An instance of a node in a tree linking streams by lifecycle */
export interface ProcessTree<A = unknown, B = A> extends IProcess {
  /** The blueprint used to create this process tree. */
  readonly spec: ProcessTreeSpec<A, B>;

  // The actual subscription created by this node... in the event that there is a process?
  // SO this is not the source, this is the OUTPUT
  readonly source: rs.ISubscribable<B>;

  // If this outputs to another node, the subscription that forwards the values
  readonly target?: rs.ISubscribable<B>;

  readonly location: null | {
    /** The process to whose life cycle this one's is tied. */
    readonly parent: ProcessTree;

    /** The key of this process with respect to its parent. */
    readonly key: string;
  };

  /** The sequence of child keys from the process tree's root to this node. */
  path(): readonly string[];

  /** Child processes whose lifespan is linked to this one's. */
  // readonly children: IView<ReadonlyMap<string, ProcessTree>>;
  // May make more sense as an atom/view, but avoiding extra dep for now
  readonly children: rs.ISubscribable<ReadonlyMap<string, ProcessTree>>;
}
