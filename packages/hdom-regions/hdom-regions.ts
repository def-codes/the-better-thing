import * as rs from "@thi.ng/rstream";
import * as tx from "@thi.ng/transducers";
import type { ILifecycle } from "@thi.ng/hdom";
import { updateDOM } from "@thi.ng/transducers-hdom";
import { CloseMode } from "@thi.ng/rstream";
import { DomProcess, RegionDefinition } from "./api";
import type { DomElementExpression } from "./dom-expression";

// Empty string ID means root

// args: {expression}

// For use with HDOM regions processor
//
// Associated with an instance of a mounted placeholder
/*
  Invariants.
  - this instance will only ever be associated with a single dom element
  - never issue "skip" on first render (per hdom docs)
  - on non-first renders
    - always issue "skip" for placeholders with definitions
    - always issue null (or dummy???) for placeholders without definitions
  - expression is already a (possibly normalized) template
 */
const Region = (): ILifecycle => {
  const state = { initialized: false, element: null };

  const transform_expression = (expression: DomElementExpression, p) => {
    // What to do...
    if (expression.element === "placeholder") {
      p.add(expression.attributes["id"]);
      return state.initialized
        ? [Region, { id: expression.attributes["id"] }]
        : null;
    }

    return [
      expression.element,
      expression.attributes || {},
      ...tx.map(
        expr =>
          typeof expr === "string" || typeof expr === "number"
            ? expr.toString()
            : transform_expression(expr, p),
        expression.children || []
      ),
    ];
  };

  return {
    init(element, context, { id }) {
      context.mounted.next({ id, element });
      state.initialized = true;
      state.element = element;
    },
    render(context, { id, expression }) {
      // it's not this node's responsibility to render that placeholder's content
      // but it is this node's responsibility to get the element
      const placeholders = new Set();
      const template = transform_expression(expression, placeholders);
      if (placeholders.size)
        console.log("YOU GOT PLACEHOLDERS", expression, template, placeholders);
      // but there's more to it, you have to remove if it was there before, etc
      for (const p of placeholders) inverse_tree.get(p).add(id);
      tree.set(id, placeholders);
      return template;
    },
    release({ unmounted }, { id }) {
      unmounted.next({ id });
    },
  };
};

export const make_dom_process = (root: Element): DomProcess => {
  const elements = new Map(); // mounted element, if any
  const templates = new Map(); // last-provided template (expression), if any
  // pubsub subscriber for placeholder
  const sources = new Map<
    string,
    rs.Subscription<RegionDefinition, DomElementExpression>
  >();
  const feeds = new Map(); // placeholder content sink.  METASTREAM?

  // Placeholder id to a set of placeholder id's referenced by the last defined template
  const tree = new Map();
  const inverse_tree = new Map(); // what we actually need

  const pluck_content = tx.map((_: RegionDefinition) => _.content);

  const pubsub = rs.pubsub<RegionDefinition, RegionDefinition>({
    topic: _ => _.id,
  });

  const ensure_source = (id: string) => {
    if (!sources.has(id))
      // Don't tear down when removing last subscriber.
      // This is meant to persist over use by multiple element feeds
      sources.set(
        id,
        pubsub.subscribeTopic(id, pluck_content, {
          closeOut: CloseMode.NEVER,
        })
      );
    return sources.get(id);
  };

  // Used by template/placeholder component
  const ctx = {
    mounted: _ => process.mounted.next(_),
    unmounted: _ => process.unmounted.next(_),
  };

  const connect_if_mounted = id => {
    const element = id ? elements.get(id) : root;
    if (element && !feeds.has(id)) {
      // Automatically sends the latest value (if one arrived first)
      feeds.set(
        id,
        ensure_source(id)
          .transform(
            tx.map(expression => [Region, { id, expression }]),
            updateDOM({ root: element, ctx, span: false, keys: false })
          )
          .subscribe({
            error(error: any) {
              console.error("UPDATE HDOM ERROR", error);
            },
          })
      );
    }
  };
  const element_feeds = new Map<Element, rs.Subscription<any, any>>();

  const process: DomProcess = {
    // This should be called `define`? (and placeholder is `require`? except it doesn't)
    //
    // stream where client writes content for placeholders
    content: rs.subscription({
      next(value) {
        const { id } = value;
        // May need to re-render container
        ensure_source(id);
        pubsub.next(value);
        connect_if_mounted(id);
        // For all elements for which this is mounted, update (dataflow should handle)
        //
        // For all regions that contained a reference to this placeholder but
        // didn't mount it (because they had no definition... or because
        // they... didn't render it the first time), re-render now, with
        // knowledge of the new definition
      },
    }),
    // exposed so it can be monitored, but used internally
    mounted: rs.subscription({
      next({ id, element }) {
        elements.set(id, element);
        connect_if_mounted(id);
      },
    }),
    unmounted: rs.subscription({
      next({ element }) {
        element_feeds.get(element)?.unsubscribe();
        // maybe some other bookkeeping here...
      },
    }),
  };
  return process;
};
