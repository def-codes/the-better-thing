define(["./lib-one.js"], lib_one => {
  console.log(`THING_ONE says LIB ONE `, lib_one);
  return { name: "thing one", op: fizz => lib_one.make("fizz") };
});
