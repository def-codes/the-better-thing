define(["@thi.ng/transducers", "@thi.ng/rstream"], (tx, rs) => {
  console.log("tx", tx);
  console.log("rs", rs);

  // A clock is the most basic stream.
  //
  // Some clocks attempt to be regular
  // Some make no such promises (stochastic clocks)
  //
  //
  const clock_function = rs.fromInterval(100);

  const trigger_function = event;
  const transition_function = (state, message) => {
    return "something";
  };

  return {
    thing: "moving",
  };
});
