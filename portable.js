requirejs(["@thi.ng/transducers", "@def.codes/meld-demo"], tx => {
  // Make streams from all events of interest
  // - hover
  // - touch
  // - drag
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

  const closest_draggable = ele => {
    do {
      if (ele.draggable) return ele;
    } while ((ele = ele.parentNode));
  };

  // feature detection, blah
  document.body.addEventListener(
    "touchstart",
    function(event) {
      let draggable = closest_draggable(event.originalTarget);
      if (draggable) {
        console.orig.log(`draggable`, draggable);
        event.preventDefault();
        // and initiate a synthetic drag event
      }
    },
    { capture: true, passive: false }
  );

  for (const name of DRAG_EVENT_NAMES)
    document.body.addEventListener(name, log(name));
});
