define(["/draw-sine-wave-on-canvas.js"], ({ draw_sine_wave_on }) => {
  const canvas = document.querySelector("canvas");
  canvas.style.width = "100%";
  canvas.style.height = "20rem";
  // canvas.style.border = "1px solid red";

  // A clock is the most basic stream.
  //
  // Some clocks attempt to be regular
  // Some make no such promises (stochastic clocks)
  //
  //
  let i = 0;
  window.setInterval(() => {
    draw_sine_wave_on(canvas, i++);
  }, 1000 / 20);

  // in DeMO, what does trigger function correspond to?
  // const trigger_function = event;
  const transition_function = (state, message) => {
    return "something";
  };

  return {
    thing: "moving",
  };
});
