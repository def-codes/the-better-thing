// Adapted from transducers/throttleTime to debounce only for identical values.
export const debounce = (delay?: number) => <T>() => {
  delay = delay ?? 100;
  let last_time = 0,
    last_value: T;
  return (value: T) => {
    const t = Date.now();
    return last_value !== value || t - last_time >= delay
      ? (((last_time = t), (last_value = value)), true)
      : false;
  };
};
