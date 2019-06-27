// Alternate, hijacked console implementation.  Load for side-effects.
// CONSOLE IS DEAD LONG LIVE CONSOLE
import { render, render_value } from "./value-view.mjs";

// Hack for browser/node support
import * as rs1 from "../node_modules/@thi.ng/rstream/lib/index.umd.js";
import * as tx1 from "../node_modules/@thi.ng/transducers/lib/index.umd.js";
import * as txhdom1 from "../node_modules/@thi.ng/transducers-hdom/lib/index.umd.js";
const rs = Object.keys(rs1).length ? rs1 : thi.ng.rstream;
const tx = Object.keys(tx1).length ? tx1 : thi.ng.transducers;
const txhdom = Object.keys(txhdom1).length ? txhdom1 : thi.ng.transducersHdom;

const { updateDOM } = txhdom;

const container = document.body.appendChild(document.createElement("div"));

const render_entry = (_, { method, args }) => [
  "div.console-entry",
  { "data-method": method },
  tx.map(render_value, args)
];

const render_entries = (_, entries) => [
  "div.console",
  tx.map(entry => [render_entry, entry], entries)
];

const orig = {};
Object.assign(console, { orig }); // escape hatch

const sub = rs.subscription(
  {
    error(error) {
      alert("see console, sheep");
      orig.error("Alt log failed", error);
    }
  },
  tx.comp(
    tx.slidingWindow(10),
    tx.map(entries => [render_entries, entries]),
    updateDOM({ root: container, ctx: { render } })
  )
);

for (const method of ["log", "warn", "error"]) {
  orig[method] = console[method];
  try {
    console[method] = function(...args) {
      sub.next({ method, args });
      if (method === "error") orig.error(...args);
    };
  } catch (error) {
    orig.log("ERROR: ", error);
    throw error;
  }
}
