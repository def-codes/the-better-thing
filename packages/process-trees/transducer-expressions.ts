import * as tx from "@thi.ng/transducers";
import { LazyCall } from "./lazy-call";

export const map = <T, U>(
  fn: (arg: T) => U
): LazyCall<tx.Transducer<T, U>> => ({
  fn: tx.map,
  args: [fn],
});

export const filter = <T, U extends T>(pred: (arg: T) => arg is U) => ({
  fn: tx.filter,
  args: [pred],
});
