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

  // I don't think this can go more than one step
  const closest_droppable = node => {
    do {
      if (node.nodeType === 1) return node;
    } while ((node = node.parentNode));
  };

  const log = name =>
    function(event) {
      if (name === "dragstart") {
        const draggable = closest_draggable(event.originalTarget);
        if (draggable) {
          event.dataTransfer.effectAllowed = "all";

          // worse than default
          // event.dataTransfer.setDragImage(draggable, 0, 0);

          // What is this supposed to be?
          event.dataTransfer.setData("text/plain", window.location.toString()); // draggable.innerText);
        } else console.orig.warn("expected draggable for dragstart", event);
      } else if (name === "dragenter") {
        const droppable = closest_droppable(event.originalTarget);
        if (droppable) {
          const effect = "link";
          droppable.setAttribute("drop-effect", effect);
          // droppable.classList.add("DropTarget");
          event.dataTransfer.dropEffect = effect;

          // Valid targets must to do this on enter and over
          event.preventDefault();
        }
      } else if (name === "dragover") {
        // Is this necessary here, if it was set during enter & doesn't change?
        event.dataTransfer.dropEffect = "link";

        // Valid targets must to do this on enter and over (at least once)
        event.preventDefault();
      } else if (name === "dragleave") {
        if (event.originalTarget.nodeType === 1)
          event.originalTarget.removeAttribute("drop-effect");
      } else console.orig.log(name);
    };

  // feature detection, blah
  document.body.addEventListener(
    "touchstart",
    function(event) {
      let draggable = closest_draggable(event.originalTarget);
      if (draggable) {
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
