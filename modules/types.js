define([], () => {
  const TYPES = {
    Sequence: {
      comment:
        "runtime has `Iterable` protocol.  Turtle has list syntax; RDF otherwise strictly unordered",
    },
    Queue: {
      comment:
        "well-known interface.  can has transducer.  async, blocking read/write.",
    },
    "d3:forceManyBody": {},
    "d3:forceX": {},
    "d3:forceY": {},
    WindowingBuffer: {},
    FixedBuffer: { subclassOf: "WindowingBuffer" },
    SlidingBuffer: { subclassOf: "WindowingBuffer" },
    Panel: {},
    XAxis: { dom: [{ matches: '[data-axis="x"]' }] },
    YAxis: { dom: [{ matches: '[data-axis="y"]' }] },
    Person: {
      name: "",
    },
    Collection: {},
    Simulation: {},
    ForceManyBody: {},
    Map: {},
    Stream: {},
    Runner: { comment: "something that runs about" },
    Counter: { comment: "monotonic increment (source, sync, proc)" },
    Sink: {},
    Source: {},
    StreamSync: { subclassOf: "Stream" },
    Space: {
      styles: {},
      "x-axis": { a: "XAxis" },
      "y-axis": { a: "YAxis" },
    },
  };

  return { TYPES };
});
