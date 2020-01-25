const convert = require("./thing-to-dot-statements");

module.exports = Object.fromEntries(
  Object.entries(convert).map(([name, converter]) => [
    name,
    (...args) => converter(...args).dot_statements,
  ])
);
