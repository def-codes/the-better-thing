define(["./common.js"], () => {
  require(["./lateral-lib.js"], huh => ({ huh, tepid: "earthquake" }));
  return { make: type => `making ${type}` };
});
