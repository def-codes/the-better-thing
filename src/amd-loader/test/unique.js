require(["./alpha.js", "./beta.js"], (a1, { alpha: a2 }) => {
  console.log(`unique: a1===a2, a1, a2`, a1 === a2, a1, a2);
});
