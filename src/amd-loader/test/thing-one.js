define(["./lib/one.js"], lib_one => {
  let n = 1;
  console.log(`take ${n++}: THING_ONE says LIB ONE `, lib_one);
  return { name: "thing one", op: fizz => lib_one.make("fizz") };
});
