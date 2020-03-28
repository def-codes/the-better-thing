import * as tx from "@thi.ng/transducers";
import { HDOMOpts } from "@thi.ng/hdom";
import { datafy } from "@def.codes/datafy-nav";
import { updateDOM } from "@thi.ng/transducers-hdom";
import { render, render_value } from "@def.codes/meld-core";

// Array is less coupled and more transparent than tx.comp, but no type chaining
export const stack = (
  opts: Partial<HDOMOpts>,
  n: number = 10
): tx.Transducer<any, any>[] => [
  // The monotonic key prevents in-place updates on these items, supports
  // “moving layers” effect
  tx.multiplexObj({
    key: tx.scan(tx.count()),
    thing: tx.noop(),
  }),
  tx.map(({ key, thing }) => [
    "li.output",
    { key },
    [render_value, datafy(thing)],
  ]),
  // Not monotonic
  tx.slidingWindow(n),
  tx.map<unknown[], unknown>(items => ["ul.Stack", {}, tx.reverse(items)]),
  updateDOM({ ctx: { render }, ...opts }),
];
