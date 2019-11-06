// TEMP: not essential to this package, just a (DOM) stream source
import { stream, ISubscribable } from "@thi.ng/rstream";
import { fromMutationObserver } from "./from-mutation-observer";

export const dom_query_stream = (
  selector: string,
  root: Element = document.body
): ISubscribable<Element> => {
  // WIP more functional/declarative approach
  /*
  const stream1 = trigger(root.querySelector(`#${id}`));
  // But don't create this unless you get to that point in the stream
  const stream2 = fromMutationObserver(root, { attributeFilter: ["id"] });
  const xform2 = tx.comp(
    tx.pluck("target"),
    tx.filter(target => target instanceof Element && target.id === id)
  );
  const xform = tx.comp(tx.keep(), tx.take(1));
  */

  return stream<Element>(sub => {
    // Resolve synchronously if you have it now.
    const ele = root.querySelector(selector);
    if (ele) sub.next(ele);
    else {
      // An attribute change or a structural change could cause the selector to match.
      const mut = fromMutationObserver(root, {
        subtree: true,
        childList: true,
        attributes: true,
      });
      const done = () => mut.cancel();
      mut.subscribe({
        done,
        // Mutation observer doesn't work the way you think...
        // it only posts the *root* node that changed, not descendants
        // so ignore actual record and just re-test after every change
        next: () => {
          const ele = root.querySelector(selector);
          if (ele) sub.next(ele);
        },
      });
      return done;
    }
  });
};
