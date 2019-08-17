// amd loader with async maps
(function() {
  // =============================
  const sleep = ms => new Promise(resolve => window.setTimeout(resolve, ms));

  define("C", ["A", "B"], (a, b) => `${a} and ${b}`);

  (async function() {
    await sleep(1000);
    console.log(`defining B`);
    let beta = 0;
    define("B", [], () => `beta ${++beta}`);

    await sleep(1000);
    console.log(`defining A`);
    define("A", "alpha");
  })();

  require(["C"], c => console.log(`I required c:`, { c }));
  require(["C", "B"], (c, b) => console.log(`I required c & b:`, { c, b }));
  require(["A", "B"], (a, b) => console.log(`I required a & b:`, { a, b }));
  require(["A"], a => console.log(`I required a:`, { a }));
  require(["B"], b => console.log(`I required b:`, { b }));
})();
