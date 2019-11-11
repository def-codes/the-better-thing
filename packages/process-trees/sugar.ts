// helper functions for typed nodes, mainly for matching T in source and process
import { ISubscribable } from "@thi.ng/rstream";
import { Transducer } from "@thi.ng/transducers";
import { LazyCall } from "./lazy-call";
import { ProcessTreeSpec, ProcessMapping } from "./api";

export const proc = <T>(
  source: string | LazyCall<ISubscribable<T>>,
  process?: ProcessMapping<T>
): ProcessTreeSpec<T> => ({ source, process });

export const x_proc = <T, U>(
  xform: LazyCall<Transducer<T, U>>,
  process?: ProcessMapping<U>
): ProcessTreeSpec<T, U> => ({ source: ".", xform, process });

export const in_out = <T>(
  source: LazyCall<ISubscribable<T>>,
  forward_to: string
): ProcessTreeSpec<T> => ({ source, forward_to });

export const in_x_out = <T, U>(
  source: string | LazyCall<ISubscribable<T>>,
  xform: LazyCall<Transducer<T, U>>,
  forward_to: string
): ProcessTreeSpec<T, U> => ({ source, xform, forward_to });
