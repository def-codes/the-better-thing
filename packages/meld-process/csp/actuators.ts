import { Scheduler } from "./schedulers";

/** A stateful mechanism for advancing a generator using a given scheduler. */
export class Actuator<T> {
  done = false;
  readonly generator: Generator;
  scheduler: Scheduler<T>;

  // This should not really be optional, but it can't be set in the constructor
  // if the actuator doesn't start right away.
  signal_complete: ((t?: T) => void) | null = null;

  constructor(generator: Generator, scheduler: Scheduler) {
    this.generator = generator;
    this.scheduler = scheduler;
  }
  go() {
    return new Promise(resolve => {
      this.signal_complete = resolve;
      this.schedule();
    });
  }
  stop() {
    // HACK: not semantically the same
    // TODO: cancel any in-flight promise?
    // TODO: signal complete?
    this.done = true;
  }
  schedule(value?: T) {
    this.scheduler(value).then(this.tick);
  }
  tick = value => {
    let next;
    try {
      next = this.generator.next(value);
    } catch (error) {
      // This at least gives you a stack trace, unlike unhandled rejection.
      // But generally not sure what to do with this
      //console.log(error);
      try {
        // `es2015.iterable.d.ts` says throw is optional, but really?
        if (this.generator.throw) this.generator.throw(error);
      } catch (error) {
        if (this.signal_complete) this.signal_complete();
        return;
      }
      //this.signal_complete(error);
      // This really amounts to the same thing.
      //this.signal_fail(error);
      return;
    }
    if (next.done === true) {
      this.done = true;
      if (this.signal_complete) this.signal_complete(next.value);
    } else this.schedule(next.value);
  };
}
