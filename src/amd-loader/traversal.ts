// The part where we scan through the dependencies
// This involves resolving the name (which is at a lower level)
//
// Doesn't matter whether it's a depth-first traversal or a breadth-first.  The
// requirement is just that you can (at least asynchronously) list the steps
// that you can go from here.  So it's kind of like async datafy/nav.  In that
// you can collect metadata.  And that's where the relative resolution bug
// occurs.  Has nothing to do with execution of the factory.  Once you get this
// right, then the factory execution follows.
//
// But what is it that you return, exactly?  You return something that can
// lazily be evaluated to create the define.
//
// And what is the node, exactly?  It's a definition plus some kind of loading
// context.
//
// Function for turning a module definition into a graph node in a given loading
// context.  Need identifiable things for this.
import { ModuleDefinition } from "./types";
const nodes_from_here = (definition: ModuleDefinition, loading_context) => {
  // `needs` cannot be resolved without resolver from context
  definition.needs.map(x => x);
};

// async graph traversal given
// but this resembles datafy/nav
