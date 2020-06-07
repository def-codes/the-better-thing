import * as rs from "@thi.ng/rstream";
import * as tx from "@thi.ng/transducers";
import * as th from "@thi.ng/transducers-hdom";
import { DomElementExpression } from "./dom-expression";
import { IDomRegionCoordinator } from "./api";

const EMPTY_OBJECT = {};
const EMPTY_ARRAY = [];
const OPTS = { closeOut: rs.CloseMode.NEVER };

/*
  Invariants.
  - this instance will only ever be associated with a single dom element
  - never issue "skip" on first render (per hdom docs)
  - on non-first renders
    - always issue "skip" for placeholders with definitions
    - always issue null (or dummy???) for placeholders without definitions
  - expression is already a (possibly normalized) template
 */

// A stateful thing is needed so that the *element* can be released.
// Is there any other way to know what element is being released?
const Template = () => {
  let state: { element?: Element } = {};
  return {
    init(element, { process }, { id }) {
      state.element = element;
      if (id) process.mounted.next({ id, element });
    },
    render: (_ctx, { id }) => ["div", { key: id, "data-dom-region": id }],
    release({ process: { unmounted } }, { id }) {
      // is id even needed?
      unmounted.next({ id, element: state.element });
    },
  };
};

const transform_expression = (expression: DomElementExpression) =>
  expression.element === "placeholder"
    ? [Template(), { id: expression.attributes.id }]
    : [
        expression.element,
        expression.attributes || EMPTY_OBJECT,
        ...tx.map(
          expr =>
            typeof expr === "string" || typeof expr === "number"
              ? expr.toString()
              : transform_expression(expr),
          expression.children || EMPTY_ARRAY
        ),
      ];

export const make_dom_process = (): IDomRegionCoordinator => {
  const sources = new Map(); // a read/write subscription for each id
  const elements = new Map(); // needs removal when element dismounted
  const feeds = new Map(); // ditto

  const ctx: { process?: IDomRegionCoordinator } = {};

  const port = id => {
    if (!sources.has(id)) {
      sources.set(id, rs.subscription(id, OPTS));
      connect(id);
    }
    return sources.get(id);
  };
  const ports = { get: port };

  const connect = id => {
    const mounted_elements = elements.get(id);

    if (mounted_elements) {
      // Automatically sends the latest value (if one arrived first)
      for (const element of mounted_elements) {
        if (!feeds.has(element)) {
          feeds.set(
            element,
            port(id)
              .transform(
                // Not sure where the nullish values come from, but they crash
                tx.keep(),
                tx.map(transform_expression),
                th.updateDOM({ root: element, ctx })
              )
              .subscribe({ error: error => console.error("UPDATE", error) })
          );
        }
      }
    }
  };

  const process: IDomRegionCoordinator = {
    ports,
    define(id, content) {
      port(id).next(content);
    },
    mounted: rs.subscription({
      next(value) {
        const { id, element } = value;
        if (!elements.has(id)) elements.set(id, new Set());
        elements.get(id).add(element);
        connect(id);
      },
      error: error => console.error("error: mounted", error),
    }),
    unmounted: rs.subscription({
      // do we even need to know id?  yes, to update element books
      next({ id, element }) {
        if (elements.has(id)) elements.get(id).delete(element);
        if (feeds.has(element)) {
          const feed = feeds.get(element);
          if (feed) feed.unsubscribe();
          feeds.delete(element);
        }
      },
    }),
  };

  ctx.process = process;

  return process;
};
