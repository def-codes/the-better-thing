// This *has* to be define even if there are no exports, it doesn't work with
// require when this is loaded as a dependency.
define(["./thing-one.js", "./thing-two.js"], (one, two) => {
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! one", one);
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! two", two);
  console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ one.op", one.op());
  console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ two.op", two.op());
});
