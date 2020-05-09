import * as rs from "@thi.ng/rstream";

// stream based on mutation observer
export const fromMutationObserver = (
  element: Element,
  options: MutationObserverInit
): rs.Stream<MutationRecord> =>
  rs.stream(sub => {
    const mo = new MutationObserver(records => {
      for (const record of records) sub.next(record);
    });
    mo.observe(element, options);
    return () => {
      // Should do takeRecords here?  But if the stream has been canceled, then
      // expectation is no more values.
      mo.disconnect();
    };
  });
