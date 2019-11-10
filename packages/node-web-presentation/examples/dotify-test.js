const { dotify, dotify_protocol } = require("@def.codes/graphviz-format");

const value1 = { foo: "bar" };

const test1 = dotify(value1);
console.log(`test1`, test1);
