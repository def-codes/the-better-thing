requirejs(["@thi.ng/transducers", "@def.codes/meld-demo"], tx => {
  // Make streams from all events of interest
  // - hover (mouseenter/leave)
  // - touch
  // - drag
  // - mousemove
  //
  // Flow those streams into datafications

  // drag end enter exit leave over start drop

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

  let element_being_dragged;

  const on = (name, fn) =>
    document.body.addEventListener(name, fn, { capture: true });

  on("dragstart", event => {
    const draggable = closest_draggable(event.originalTarget);
    console.orig.log(`line 30`);

    if (draggable) {
      event.dataTransfer.effectAllowed = "all";
      element_being_dragged = draggable;
      // worse than default
      // event.dataTransfer.setDragImage(draggable, 0, 0);

      // What is this supposed to be?
      console.orig.log(`line 37`);

      event.dataTransfer.setData("text/plain", window.location.toString()); // draggable.innerText);
    } else console.orig.warn("expected draggable for dragstart", event);
  });

  on("dragenter", event => {
    const droppable = closest_droppable(event.originalTarget);
    if (droppable) {
      const effect = "link";
      droppable.setAttribute("drop-effect", effect);
      // droppable.classList.add("DropTarget");
      event.dataTransfer.dropEffect = effect;

      // Valid targets must to do this on enter and over
      event.preventDefault();
    }
  });

  on("dragover", event => {
    // Is this necessary here, if it was set during enter & doesn't change?
    // Doesn't appear to be
    // event.dataTransfer.dropEffect = "link";

    // Valid targets must to do this on enter and over (at least once)
    event.preventDefault();
  });

  on("dragleave", event => {
    if (event.originalTarget.nodeType === 1)
      event.originalTarget.removeAttribute("drop-effect");
  });

  on("drop", event => {
    event.preventDefault();
    // At this point it should be the element with [drop-effect]
    const droppable = closest_droppable(event.originalTarget);
    if (droppable) {
      console.orig.log(`DROP`, droppable);
      droppable.removeAttribute("drop-effect");

      if (element_being_dragged) {
        element_being_dragged.draggable = false;
        const clone = element_being_dragged.cloneNode();
        event.target.appendChild(clone);
        element_being_dragged = null;
      }
    }
  });

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

  let draggable_thing;

  const set_draggable = ele => {
    const draggable = ele.nodeType === 1 ? ele : ele.parentNode;
    if (draggable) {
      if (draggable_thing) draggable_thing.removeAttribute("draggable");
      (draggable_thing = draggable).draggable = true;
    }
  };

  document.body.addEventListener(
    "mousedown",
    function(event) {
      set_draggable(event.originalTarget);
    },
    { capture: true }
  );

  // A drag operation is a dragstart, a succession of other drag events,
  // ending with a dragend[/exit?] or drop event
});
