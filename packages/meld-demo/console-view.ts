// Wire the hijacked console to a custom value viewer.
import * as tx from "@thi.ng/transducers";
import * as rs from "@thi.ng/rstream";
import { render } from "@def.codes/meld-core";
import {
  hijack_console,
  HijackedConsoleMessage,
} from "@def.codes/console-stream";
import { stack } from "./stack";

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
    // @ts-ignore arity
    tx.comp(
      // `method` is log/warn etc.  We could indicate that or split it to
      // channels.  Note by flatteing here, we lose grouping of multiple args.
      tx.pluck<HijackedConsoleMessage, HijackedConsoleMessage["args"]>("args"),
      tx.mapcat<unknown[], unknown>(args => args),
      ...stack({ root: container, ctx: { render }, span: false }, 5)
    )
  );
}
