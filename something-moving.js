define(["draw-sine-wave-on-canvas"], ({ draw_sine_wave_on }) => {
  const canvas = document.querySelector("canvas");
  canvas.style.width = "100%";
  canvas.style.height = "20rem";
  // canvas.style.border = "1px solid red";
  draw_sine_wave_on(canvas);

  return {
    thing: "moving",
  };
});
