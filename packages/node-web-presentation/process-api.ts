// Wrangling common bits about living things that can support visiblity, etc
import { IWatch, INotify } from "@thi.ng/api";

// Is this something you'd call directly, i.e. separately from lifecycle?
export interface IDispose {
  dispose(): void;
}

// Is anything common to all processes?
interface IProcess<TState = any> extends IWatch<TState>, INotify {
  // If a process is watchable (which seems ineviable), what is it that gets
  // watched? state? the datafication (description)?
  //
  // is describable a separate interface?  isn't it identical to datafy?  Which
  // is in turn identical to unreify?
  //
  // if a process supports event listeners (notify), what does it notify
  // about?  the INotify interface requires identified events (which is good)
  // but not typed events (which is probably fine)
  //
  // state machine on life cycle? (alive -> dead)
}

// I mean, @thi.ng already has this, and if the thing is also datafiable,
// can't you just watch & reconstruct?
interface IWatchable {}
// same with notify
// except that that's for events (I guess) and not state
