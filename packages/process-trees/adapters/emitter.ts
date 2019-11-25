import { StreamSource } from "@thi.ng/rstream";
import { EventEmitter } from "events";

// Could do this and still capture domain types?
// but it would be in array

export const emitter_stream_source = (
  source: EventEmitter,
  event: string
): StreamSource<unknown> => sub => {
  const listener = event => sub.next(event);
  source.on(event, listener);
  return () => source.off(event, listener);
};

type EmitterArgs<T extends EventEmitter, E extends string> = T extends {
  on(event: E, handler: (...args: infer A) => any);
}
  ? A
  : never;

import * as ws from "ws";

export const typed_emitter_stream_source = <
  T extends EventEmitter,
  E extends string
>(
  source: T,
  event: E
): StreamSource<unknown> => sub => {
  const listener = event => sub.next(event);
  source.on(event, listener);
  return () => source.off(event, listener);
};

const blah = typed_emitter_stream_source(new ws.Server(), "connection");
