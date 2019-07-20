requirejs(["@thi.ng/transducers", "@def.codes/meld-demo"], tx => {
  console.log(`hello`);
  // console.log(`tx`, tx);
  //  make a global listener for blah
  //
  document.body.addEventListener("dragstart", function(event) {
    console.log(event);
  });
});
