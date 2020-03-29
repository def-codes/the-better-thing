define(["./draw-sine-wave-on-canvas.js"], ({ draw_sine_wave_on }) => {
  console.log(`IN SOMETHING MOVING`, draw_sine_wave_on);

  const make_something_moving_in = id => {
    const container = document.getElementById(id);
    const canvas = container.appendChild(document.createElement("canvas"));

    canvas.style.width = "100%";
    canvas.style.height = "20rem";

    let i = 0;
    window.setInterval(() => {
      draw_sine_wave_on(canvas, i++);
    }, 1000 / 20);
  };

  return { make_something_moving_in };
});
