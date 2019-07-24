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

  const closest_element = node =>
    node.nodeType === 1 ? node : node.parentElement;

  const closest_droppable = closest_element;

  let element_being_dragged;

  const on = (name, fn) =>
    document.body.addEventListener(name, fn, { capture: true });

  on("dragstart", event => {
    const draggable = closest_draggable(event.originalTarget);
    if (draggable) {
      event.dataTransfer.effectAllowed = "all";
      element_being_dragged = draggable;
      // worse than default
      // event.dataTransfer.setDragImage(draggable, 0, 0);

      // What is this supposed to be?
      event.dataTransfer.setData("text/plain", window.location.toString()); // draggable.innerText);
    }
  });

  on("dragenter", event => {
    const droppable = closest_droppable(event.originalTarget);
    if (droppable) {
      const effect = "link";
      droppable.setAttribute("drop-effect", effect);
      event.dataTransfer.dropEffect = effect;

      // Valid targets must to do this on enter and over
      event.preventDefault();
    }
  });

  on("dragover", event => {
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
    if (droppable && element_being_dragged) {
      droppable.removeAttribute("drop-effect");
      element_being_dragged.draggable = false;
      const clone = element_being_dragged.cloneNode(true);
      event.target.appendChild(clone);
      element_being_dragged = null;
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
    event => set_draggable(event.originalTarget),
    { capture: true }
  );

  // A drag operation is a dragstart, a succession of other drag events,
  // ending with a dragend[/exit?] or drop event
});
