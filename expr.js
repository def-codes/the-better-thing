// Something's not right about this.  It's more terse, but a node isn't a node
module.exports = {
  a: { type: "term", term: "a" },
  "a.b": { term: "a", next: { get: "b" } },
  "a.b.c": { term: "a", next: { get: "b", next: { get: "c" } } },
  "a = b": { assign: { term: "b" }, to: { term: "a" } },
  "a.b = c": { assign: { term: "c" }, to: { term: "a", next: { get: "b" } } },
  "a.b = c.d": {
    assign: { term: "c", next: { get: "d" } },
    to: { term: "a", next: { get: "b" } },
  },
  "(a = b).c": {
    assign: { term: "b" },
    to: { term: "a" },
    next: { get: "c" },
  },
  "a()": { term: "a", next: { apply: [] } },
  "a(b)": { term: "a", next: { apply: [{ term: "b" }] } },
  "a(b.c)": { term: "a", next: { apply: [{ term: "b", next: { get: "c" } }] } },
  "a(b)()": {
    term: "a",
    next: { apply: [{ term: "b" }], next: { apply: [] } },
  },
  "a(b = c)": {
    term: "a",
    next: { apply: [{ assign: { term: "c" }, to: { term: "b" } }] },
  },
  // testing quotes.  this doesn't crash
  // "a['what's my name']": {
  //   term: "a",
  //   next: {
  //     get: "what's my name",
  //   },
  // },
};

const blah2 = {
  a: { type: "term", term: "a" },
  "a.b": { type: "access", lhs: { type: "term", term: "a" }, term: "b" },
  "a['what's my name']": {
    type: "access",
    lhs: { type: "term", term: "a" },
    term: "what's my name",
  },
};
const blah = {
  a: { type: "term", term: "a" },
  "a = 1": {
    type: "assign",
    lhs: { type: "term", term: "a" },
    rhs: { type: "literal", value: 1 },
  },
  "a.b": {
    type: "access",
    lhs: { type: "term", term: "a" },
    term: "b",
  },
  "a()": {
    type: "apply",
    lhs: { type: "term", term: "a" },
    args: [],
  },
  "a(b, 2, c)": {
    type: "apply",
    lhs: { type: "term", term: "a" },
    args: [
      { type: "term", term: "b" },
      { type: "literal", value: 1 },
      { type: "term", term: "c" },
    ],
  },
  "a(b, c())": {
    type: "apply",
    lhs: { type: "term", term: "a" },
    args: [
      { type: "term", term: "b" },
      { type: "apply", lhs: { type: "term", term: "c" }, args: [] },
    ],
  },
  "a.b.c(d))": {
    type: "apply",
    lhs: { type: "term", term: "a" },
    args: [
      { type: "term", term: "b" },
      { type: "apply", lhs: { type: "term", term: "c" }, args: [] },
    ],
  },
};
