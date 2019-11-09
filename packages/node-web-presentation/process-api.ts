// Wrangling common bits about living things that can support visiblity, etc
import { IWatch, INotify } from "@thi.ng/api";

// Is this something you'd call directly, i.e. separately from lifecycle?
export interface IDispose {
  dispose(): void;
}

// Is anything common to all processes?
interface IProcess<TState = any> extends IWatch<TState>, INotify {
  // notify of messages about the process
  // and they have an id
  //
  // watch
}

// I mean, @thi.ng already has this, and if the thing is also datafiable,
// can't you just watch & reconstruct?
interface IWatchable {}
// same with notify
// except that that's for events (I guess) and not state
