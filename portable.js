requirejs(["@thi.ng/transducers", "@def.codes/meld-demo"], tx => {
  // Make streams from all events of interest
  // - hover (mouseenter/leave)
  // - touch
  // - drag
  // - mousemove
  //
  // Flow those streams into datafications

  const DRAG_EVENT_NAMES = [
    "drag",
    "drop",
    ..."end enter exit leave over start".split(" ").map(name => `drag${name}`),
  ];

  const closest_draggable = ele => {
    do {
      if (ele.draggable) return ele;
    } while ((ele = ele.parentNode));
  };

  const log = name =>
    function(event) {
      // console.orig.log(name);
      if (name === "dragstart") {
        const draggable = closest_draggable(event.originalTarget);
        if (draggable) {
          event.dataTransfer.effectAllowed = "all";

          // worse than default
          // event.dataTransfer.setDragImage(draggable, 0, 0);

          // What is this supposed to be?
          event.dataTransfer.setData("text/plain", "#"); // draggable.innerText);
        } else console.orig.warn("expected draggable for dragstart", event);
      } else if (name === "dragenter") {
        console.log(`enter`, event.originalTarget);
        if (event.originalTarget.nodeType === 1) {
          console.log(`..element`, event.originalTarget);

          event.preventDefault();
          event.originalTarget.classList.add("DropTarget");
        }
      } else if (name === "dragover") {
        // Only matters if same was done during dragenter
        console.log(`move`, event.originalTarget);

        event.dataTransfer.dropEffect = "move";
        event.preventDefault();
      } else if (name === "dragleave") {
        console.orig.log("drag leave", event.originalTarget);
        if (event.originalTarget.nodeType === 1) {
          event.originalTarget.classList.remove("DropTarget");
        }
      } else console.log(name);
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

  // A drag operation is a dragstart, a succession of other drag events,
  // ending with a dragend[/exit?] or drop event
});
