import * as rs from "@thi.ng/rstream";
import { LazyCall } from "./lazy-call";

export const interval = (ms: number): LazyCall<rs.ISubscribable<number>> => ({
  fn: rs.fromInterval,
  args: [ms],
});
