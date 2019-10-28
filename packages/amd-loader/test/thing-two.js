define(["./lib/two.js"], lib_two => {
  console.log(`THING_TWO says LIB TWO `, lib_two);
  return { name: "thing two", op: buzz => lib_two.make("buzz") };
});
