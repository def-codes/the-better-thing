// synchronous sequence
// pull-based stream
// a generator is not a process as such, in that it can't do anything on its own
// i.e. it's not a call site for events that can occur at any time
// (though with yield I'm not so sure)
// but it certainly is stateful
// and resembles other basic things in some ways
// it has an input port, i.e. it can be fed.  this causes its output to go
// I mean it's kinda like a stateful transducer, maybe that doesn't need a seed value
// or rather, it ignores the input *value* and just gets triggered
//
// STATE MACHINE
// states:
// - alive (initial)
// - error (terminal?)
// - done (terminal)
// transitions:
// - alive --next--> alive
// - alive --next--> done
// - alive --error--> error
// - alive --done--> done
