import * as rs from "@thi.ng/rstream";
import * as tx from "@thi.ng/transducers";
import { EquivMap } from "@thi.ng/associative";
import {
  DomProcess,
  PlaceholderPath,
  TemplateSink,
  PlaceholderContentMessage,
  ISubscribableSubscriber,
  TemplateContextGetter,
} from "./api";
import { DomElementExpression } from "./dom-expression";
import { implementation } from "./adapters/hdom";

export const make_dom_process = (): DomProcess => {
  const templates = new EquivMap<PlaceholderPath, DomElementExpression>();
  const elements = new EquivMap<PlaceholderPath, Element>();
  const subscriptions = new EquivMap<
    PlaceholderPath,
    rs.Subscription<DomElementExpression, DomElementExpression>
  >();
  const sources = new EquivMap<
    PlaceholderPath,
    ISubscribableSubscriber<DomElementExpression>
  >();
  const targets = new EquivMap<PlaceholderPath, TemplateSink>();

  const mounted = (path: PlaceholderPath) => (name: string, element: Element) =>
    process.mounted.next({ path: [...path, name], element });

  const update = (path: PlaceholderPath) => {
    if (elements.has(path) && templates.has(path)) {
      const container = elements.get(path)!;
      const expression = templates.get(path)!;
      implementation.process_node(mounted(path), container, expression);
    }
  };

  const pubsub = rs.pubsub<
    PlaceholderContentMessage,
    PlaceholderContentMessage
  >({
    topic: _ => _.path,
  });

  const pluck_content = tx.pluck<any, DomElementExpression>("content");

  const ensure_source = (
    path: PlaceholderPath
  ): ISubscribableSubscriber<DomElementExpression> => {
    if (!sources.has(path))
      // TS: The pubsub types appear to be wrong
      sources.set(
        path,
        (<unknown>(
          pubsub.subscribeTopic(path, pluck_content)
        )) as ISubscribableSubscriber<DomElementExpression>
      );

    return sources.get(path)!;
  };

  const register_sink = (path: PlaceholderPath, sink: TemplateSink) => {
    targets.set(path, sink);
    connect_if_target(path);
  };

  const connect_if_target = (path: PlaceholderPath) => {
    if (targets.has(path)) {
      const parent_sink = targets.get(path)!;
      const source = ensure_source(path);
      const existing = subscriptions.get(path);
      // No, need a dummy sub for this to work?
      if (existing) existing.unsubscribe();
      // inject mapping to next step down for *subprocesses*
      const get_child_context: TemplateContextGetter = name => ({
        notify_mounted: child_sink =>
          register_sink([...path, name], child_sink),
      });
      // Apply the most recent value now in case it arrived first
      const last = source.deref();
      if (last !== undefined) parent_sink(last, get_child_context, path);
      subscriptions.set(
        path,
        source.subscribe({
          next: expression => parent_sink(expression, get_child_context, path),
        })
      );
    }
  };

  // WHAT if multiple things are asserting that content goes here?
  // That was a problem before, this will just not “toggle” between them in the same way
  // Ultimately, need multi-party, order-agnostic assertions.  That's further down the line
  // const content_cache = new EquivMap<PlaceholderPath, DomElementExpression>();
  const process: DomProcess = {
    // For the top level only
    notify_mounted(template_sink) {
      register_sink([], template_sink);
    },
    content: rs.subscription({
      next(value) {
        const { path, content } = value;
        ensure_source(path);
        pubsub.next(value);
        if (!subscriptions.has(path)) connect_if_target(path);
      },
    }),

    mounted: rs.subscription({
      next({ path, element }) {
        elements.set(path, element);
        update(path);
      },
    }),
  };
  return process;
};
