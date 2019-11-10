module.exports.main = () => ({
  "@type": "http://graphviz.org/doc/info#Graph",
  directed: true,
  statements: [
    { type: "node", id: "foo" },
    { type: "node", id: "bar" },
    { type: "node", id: "baz" },
    { type: "node", id: "bat" },
    { type: "node", id: "bananas" },
    { type: "edge", from: "bananas", to: "bat" },
    { type: "edge", from: "foo", to: "bar" },
    { type: "edge", from: "bananas", to: "bananas" },
    { type: "edge", from: "bar", to: "bat" },
    { type: "edge", from: "bat", to: "foo" },
  ],
});
