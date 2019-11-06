// Wrangling common bits about living things that can support visiblity, etc
import { IWatch, INotify } from "@thi.ng/api";

// Is this something you'd call directly, i.e. separately from lifecycle?
interface IDispose {
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

// anyway, what matters is that you can
// - at a single point, construct the current process/thing graph of a system
// - get notified every time something in that has changed
// - in a “localized” way:  i.e. not necessarily for the whole system every time
// - efficiently (without an O(N) synchronous op on the whole graph)
// - without creating N more processes/subsystems
//   - meaning that you can partition off some part of the system
// - requires you to decide what you can & can't know about things in & out
// - also requires you decide what you mean by “watch”
// watch versus watch deep
//
// does it need to be possible to watch only “part” of a process?
//
// a change in something related to a process does not count as a change to the
// process for watch purposes
//
// watchdeep presupposes either a tree or some way to identify entities
// “deep” is at the other extreme
// how do you specify how much you want to watch if it's not everything?
// is this really something you want to be asking?
// and isn't it more a problem of the consumer than of the interface?
// i.e. isn't the individual thing still only responsible for watching itself?
// sounds good -- but doesn't that then mean that you have to make N watches
// (and thus N subprocesses) for N things?  and is there any way around that?
//
// so the big thing is just being able to identify things consistently
//
// and what about when things go away?
// that's where you need process die
//
// implication of all this is that
// - you really build the watcher on (duh) IWatch
// - putting description over the wire requires unreify/describe/datafy
