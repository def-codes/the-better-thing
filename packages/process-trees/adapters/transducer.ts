// LABEL: transducer
//
// COMMENT:
// synchronous stream transform
// extends sequence process type with defined transforms
// N:M
// can be used with port or channel
// adapter for basic stream transformers
// note that this should *not* be used for transducers that are themselves processes or subsystems
// those should have special adapters
//
// REFLECT:
// rstream transducers are not self-descriptive
//
// REIFY:
// currently from general bindings
// but I've added some special bindings
// ultimately each transducer type will need its own desc, see below
//
// MESSAGES:
// sequence values
//
// STDIN:
// incoming values to transform
//
// STDOUT:
// outgoing transformed values
//
// ENTAILED/CONTINGENT THINGS:
// none
//
//
// STATE MACHINE
// states
// - alive (initial)
// - done (terminal)
// - error (terminal)
// SAME as for other sequences (see `generator`)
/////

// Would each transform have its own type?
// I think so... this would be like an abstract class
export interface TransducerDescription {}
