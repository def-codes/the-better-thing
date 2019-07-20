// Wire the hijacked console to a custom value viewer.
import * as tx from "@thi.ng/transducers";
import * as rs from "@thi.ng/rstream";
import { updateDOM } from "@thi.ng/transducers-hdom";
import { render, render_value } from "@def.codes/meld-core";
import {
  hijack_console,
  HijackedConsoleMessage,
} from "@def.codes/console-stream";
import { datafy } from "@def.codes/datafy-nav";

// This is monotonic.  This should be append only.

// The listener to this does not dispatch anything else.

// Suppose that if we give it no tokens, it cannot.

export function register_console() {
  hijack_console();

  if (!console.source) {
    console.log("Console stream source not found.  SAD!");
    return;
  }

  const container = document.body.appendChild(document.createElement("div"));
  container.classList.add("console");
  container.classList.add("value-view");
  container.classList.add("Lens");

  rs.stream(console.source).subscribe(
    {
      error(error: any) {
        alert("see console, sheep");
        console.orig.error("Alt log failed", error);
      },
    },
    tx.comp(
      tx.slidingWindow(10),
      tx.map(entries => [
        "output",
        tx.map(value => [render_value, { value: value["args"] }], entries),
      ]),
      // tx.map(datafy),
      updateDOM({ root: container, ctx: { render }, span: false })
    )
  );
}
