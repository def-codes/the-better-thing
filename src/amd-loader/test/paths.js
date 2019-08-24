require(["@thi.ng/transducers", "@thi.ng/rstream"], (tx, rs) => {
  console.log(`RESOLVED @thi.ng modules:`, tx, rs);
  return { tx, rs };
});
