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
        alert("see console, friend");
        console.orig.error("Alt log failed", error);
      },
    },
    tx.comp(
      // `method` is log/warn etc.  We could indicate that or split it to
      // channels.  Note by flatteing here, we lose grouping of multiple args.
      tx.pluck<HijackedConsoleMessage, HijackedConsoleMessage["args"]>("args"),
      tx.mapcat(args => args),
      // The monotonic key prevents in-place updates on these items, supports
      // “moving layers” effect
      tx.multiplexObj({
        key: tx.scan(tx.count()),
        thing: tx.noop(),
      }),
      tx.map(({ key, thing }) => [
        "output",
        { key },
        [render_value, datafy(thing)],
      ]),
      // Not exactly monotonic
      tx.slidingWindow(20),
      tx.map(blah => ["div.layers", {}, blah.reverse()]),
      updateDOM({ root: container, ctx: { render }, span: false })
    )
  );
}
