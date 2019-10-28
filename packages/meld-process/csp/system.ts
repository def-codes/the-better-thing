import { Channel } from "./channels";
import { Actuator } from "./actuators";
import { immediate, Scheduler } from "./schedulers";

const DEFAULT_SCHEDULER = immediate;
const GET_DEFAULT_SCHEDULER = () => DEFAULT_SCHEDULER;

export type SystemSink = (pid: number, ...args: any[]) => void;

export interface GeneratorProcess<T = any> {
  (this: Process, ...args: any[]): IterableIterator<T>;
}

/** Prototype for use as `this` binding in managed process functions. */
// This is currently only used by `System` and is not part of the public API.
export class Process<P = any> {
  system: System;
  pid: number;
  fn: Function;
  sink: (message: string) => void; // SystemSink; no because it's pre-bound to pid
  actuator: Actuator<P> | null = null;

  constructor(system, pid, fn, sink) {
    this.system = system;
    this.pid = pid;
    this.fn = fn;
    this.sink = sink; // HUH? this is unused here
  }
  die() {
    // TODO: and cleanup resources, etc.
    if (this.actuator) this.actuator.stop();
  }
  run(args) {
    this.actuator = new Actuator(
      this.fn.apply(this, args),
      this.system.get_default_scheduler()
    );
    return this.actuator.go();
  }

  spawn(fn: Function, args: any[]) {
    return this.system.spawn(this, fn, args);
  }

  put<T>(ch: Channel<T>, val: T): void | Promise<void> {
    const result = ch.put(val);
    // Promise.resolve(result).then(() => this.system.log_put(this, ch, val));
    // ASSUME put will succeed
    this.system.log_put(this, ch, val);
    return result;
  }

  take<T>(ch: Channel<T>): T | Promise<T> {
    const result = ch.take();
    Promise.resolve(result).then(val => this.system.log_take(this, ch, val));
    return result;
  }
}

/** A process container that serves as their bookkeeper and point of contact. */
export class System {
  processes: Process[] = [];
  sink: SystemSink;
  get_default_scheduler: () => Scheduler;
  // I'd expect a WeakMap to work here, since the channels are held by the
  // main process, but they disappear right away.
  channels = new Map<Channel<any>, number>();

  constructor(fn, args, sink, get_default_scheduler?) {
    this.sink = sink;
    this.get_default_scheduler = get_default_scheduler || GET_DEFAULT_SCHEDULER;

    const proc = this.create_process(fn);
    this.sink(proc.pid, {
      init: { pid: proc.pid, fn: fn.name, args },
    });
    proc.run(args);
  }
  die() {
    this.processes.forEach(_ => _.die());
  }

  identify_channel(ch: Channel) {
    if (!this.channels.has(ch)) this.channels.set(ch, this.channels.size);
    return this.channels.get(ch);
  }

  log_put(proc, ch, value) {
    this.sink(proc && proc.pid, {
      channel: this.identify_channel(ch),
      put: value,
    });
  }

  log_take(proc, ch, value) {
    this.sink(proc && proc.pid, {
      channel: this.identify_channel(ch),
      take: value,
    });
  }

  /** Create and register a new process based on the given function. */
  // Implies the process can be restarted with different arguments?
  create_process(fn) {
    const pid = this.processes.length;
    const proc = new Process(this, pid, fn, this.sink.bind(this, pid));
    this.processes.push(proc);
    return proc;
  }

  /** When one process begets another. */
  spawn(parent: Process, fn: Function, args: any[]) {
    const proc = this.create_process(fn);
    this.sink(parent.pid, { spawned: { pid: proc.pid, fn: fn.name, args } });
    return proc.run(args);
  }
}
