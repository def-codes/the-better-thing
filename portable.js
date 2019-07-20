requirejs(["@thi.ng/transducers", "@def.codes/meld-demo"], tx => {
  // console.log(`hello`);
  // console.log(`tx`, tx);
  //  make a global listener for blah
  //
  //

  // Make streams from all events
  //
  // Flow those streams into datafications

  const DRAG_EVENT_NAMES = [
    "drag",
    "drop",
    ..."end enter exit leave over start".split(" ").map(name => `drag${name}`),
  ];

  const log = name =>
    function(event) {
      console.log(name);
    };

  for (const name of DRAG_EVENT_NAMES)
    document.body.addEventListener(name, log(name));
});
