/*global define*/

define([""], function(module) {
  // Yes, HDOM
  function draw_sine_wave_on(canvas, freq = 10) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    context.strokeStyle = "rgba(0, 0, 255, 0.6)";
    context.lineWidth = 1;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.beginPath();
    context.moveTo(0, 0);
    for (let x = 0; x < canvas.width; x++)
      context.lineTo(x, (Math.sin(x / freq) * height) / 2 + height / 2);
    context.stroke();
  }

  return {
    draw_sine_wave_on,
  };
});
