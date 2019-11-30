const lib = require("./some-lib");

console.log(`line 6`);

const counter = {};
counter.counter = counter;

const square = n => n * n;

module.exports = { things: { counter, square }, lib };
