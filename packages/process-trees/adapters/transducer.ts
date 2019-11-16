// Now that transducers are processes...
// adapter for basic stream transformers
// note that this should *not* be used for transducers that are themselves processes or subsystems
// those should have special adapters
//
// STATE MACHINE
// states
// - alive (initial)
// - done (terminal)
// - error (terminal)
