// Wire the hijacked console to a custom value viewer.
import * as tx from "@thi.ng/transducers";
import * as rs from "@thi.ng/rstream";
import { updateDOM } from "@thi.ng/transducers-hdom";
import { render, render_value } from "@def.codes/meld-core";
import {
  hijack_console,
  HijackedConsoleMessage
} from "@def.codes/console-stream";

const render_entry = (_: any, { method, args }: HijackedConsoleMessage) => [
  "div.console-entry",
  { "data-method": method },
  tx.map(render_value, args)
];

const render_entries = (_: any, entries: Iterable<HijackedConsoleMessage>) => [
  "div.console",
  tx.map(entry => [render_entry, entry], entries)
];

export function register_console() {
  hijack_console();

  if (!console.source) {
    console.log("Console stream source not found.  SAD!");
    return;
  }

  const container = document.body.appendChild(document.createElement("div"));

  rs.stream(console.source).subscribe(
    {
      error(error: any) {
        alert("see console, sheep");
        console.orig.error("Alt log failed", error);
      }
    },
    tx.comp(
      tx.slidingWindow(10),
      tx.map(entries => [render_entries, entries]),
      updateDOM({ root: container, ctx: { render } })
    )
  );
}
