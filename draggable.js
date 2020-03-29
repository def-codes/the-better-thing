// see
// http://www.aosabook.org/en/500L/blockcode-a-visual-programming-toolkit.html

// FROM touch punch

/**
 * Simulate a mouse event based on a corresponding touch event
 * @param {Object} event A touch event
 * @param {String} simulatedType The corresponding mouse event
 */
// [gpc] removed `originalEvent` references (from jquery)
function simulateMouseEvent(event, simulatedType) {
  // [gpc] “ignore” == retain default handling
  //
  // Ignore multi-touch events
  if (event.touches.length > 1) return;

  event.preventDefault();

  var touch = event.changedTouches[0],
    simulatedEvent = document.createEvent("MouseEvents");

  // Initialize the simulated mouse event using the touch event's coordinates
  simulatedEvent.initMouseEvent(
    simulatedType, // type
    true, // bubbles
    true, // cancelable
    window, // view
    1, // detail
    touch.screenX, // screenX
    touch.screenY, // screenY
    touch.clientX, // clientX
    touch.clientY, // clientY
    false, // ctrlKey
    false, // altKey
    false, // shiftKey
    false, // metaKey
    0, // button
    null // relatedTarget
  );

  // Dispatch the simulated event to the target element
  event.target.dispatchEvent(simulatedEvent);
}

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
    const draggable = closest_draggable(event.target);
    if (draggable) {
      event.dataTransfer.effectAllowed = "all";
      event.dataTransfer.setData(
        "text/html",
        "<p>I am some HTML become death</p>"
      );
      event.dataTransfer.setData("text/plain", "I am some text become death");
      // This is a Chrome-only extension and only works with actual server-side files
      // (not ones constructed in the browser.  See https://paul.kinlan.me/unintended-silos/
      // event.dataTransfer.setData(
      //   "DownloadURL",
      //   "text/plain:foo.txt:https://localhost/example.txt"
      // );
      element_being_dragged = draggable;
      // worse than default
      // event.dataTransfer.setDragImage(draggable, 0, 0);

      // What is this supposed to be?
      // event.dataTransfer.setData("text/plain", window.location.toString()); // draggable.innerText);
    }
  });

  on("dragenter", event => {
    const droppable = closest_droppable(event.target);
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

  // This doesn't cover the case where you move from parent to child
  // i.e. parent keeps drop effect and now you appear to have two targets
  on("dragleave", event => {
    if (event.target.nodeType === 1)
      event.target.removeAttribute("drop-effect");
  });

  on("drop", event => {
    event.preventDefault();
    // At this point it should be the element with [drop-effect]
    const droppable = closest_droppable(event.target);
    if (droppable && element_being_dragged) {
      droppable.removeAttribute("drop-effect");
      element_being_dragged.draggable = false;
      const clone = element_being_dragged.cloneNode(true);
      event.target.appendChild(clone);
      element_being_dragged = null;
    }
  });

  let draggable_thing;

  const set_draggable = ele => {
    let draggable;
    try {
      // When using a slider input, apparently events fire on a “Restricted”
      // node (I guess representing the handle).  In that particular case you
      // want the default behavior anyway.  But this probably applies to other
      // built-in widgets also.
      //
      // *UPDATE*: I'm not seeing any indication now of a “restricted” node, at
      // least on Ubuntu.  And since the thumb pseudo-element isn't treated as a
      // separate node for mouse events, the result is that you can't actually
      // use range inputs if they're draggable.
      if (!ele.matches('input[type="range"]'))
        draggable = ele.nodeType === 1 ? ele : ele.parentNode;
    } catch (error) {
      return;
    }
    if (draggable) {
      if (draggable_thing) draggable_thing.removeAttribute("draggable");
      (draggable_thing = draggable).draggable = true;
    }
  };

  document.body.addEventListener(
    "mousedown",
    // Primary button only
    event => event.buttons === 1 && set_draggable(event.target),
    { capture: true }
  );

  // feature detection, blah (re listeners args

  document.body.addEventListener(
    "touchmove",
    touch_event => {
      simulateMouseEvent(touch_event, "mousemove");
    },
    { capture: true, passive: false }
  );

  document.body.addEventListener(
    "touchstart",
    touch_event => {
      simulateMouseEvent(touch_event, "mousedown");
    },
    { capture: true, passive: false }
  );
  // A drag operation is a dragstart, a succession of other drag events,
  // ending with a dragend[/exit?] or drop event
});
