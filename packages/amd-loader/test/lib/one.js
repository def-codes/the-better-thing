define(["./common.js"], common => {
  console.log(`lib one says`, common);
  require(["./lateral.js"], lateral => {
    console.log(`GREETINGS FROM INSIDE REQUIRE INSIDE DEFINE`, lateral);
  });
  return { make: type => `making ${type}` };
});
