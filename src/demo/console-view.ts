// Wire the hijacked console to a custom value viewer.
import * as tx from "@thi.ng/transducers";
import * as rs from "@thi.ng/rstream";
import { updateDOM } from "@thi.ng/transducers-hdom";
import { render, render_value } from "./value-view";

const render_entry = (_, { method, args }) => [
  "div.console-entry",
  { "data-method": method },
  tx.map(render_value, args)
];

const render_entries = (_, entries) => [
  "div.console",
  tx.map(entry => [render_entry, entry], entries)
];

function register_console() {
  // Depends on console shim having been loaded.
  if (!console.source) {
    console.log("Console stream source not found.  SAD!");
    return;
  }

  const container = document.body.appendChild(document.createElement("div"));

  rs.stream(console.source).subscribe(
    {
      error(error) {
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

register_console();
