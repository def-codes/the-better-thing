import { register_console } from "./console-view";
import { show_example } from "./show-example";
import { show_mind_map } from "./show-mind-map";

export function main() {
  register_console();
  // what's the (top-level) subject?
  // the system, or a model?
  //
  // if the top-level topic is handled by giving it to the system
  // then "system" as the top-level topic necessitates reflection
  // meaning we must reify the System
  //
  // A reification spree
  //
  //
  // Here, we interpret the window location
  //
  // We must reify Interpreter.
  //
  //     meld:Interpreter a owl:Class
  //
  //

  // TURN THIS INTO A STREAM
  // MAKE A SYSTEM
  // FEED THIS TO THE SYSTEM
  //
  // What do you need to bootstrap the system?
  //
  // Claims.
  // The system won't do anything without claims.
  // The system is just a claim interpreter.
  // It's actor model.  Some actors are interpreters.
  //
  // How do the actors get there in the first place, though?
  // By way of a description, which was given to an actor driver.
  //
  // And how did the actor driver get there in the first place?
  // By way of a driver loader.
  //
  // And where did the driver loader come from?
  // The driver loader is the system.  QED
  //
  // And who gave the actor driver the description?
  // The claim store.
  //
  // And where did this claim come from?
  // You would have to check its provenance.
  //
  // And what if it has no provenance?
  // Then it is asserted by the model.
  //
  // And how did the model come into possession of the claim?
  // The host fed the claim to the system.
  //
  // And where did the host get the claim?
  // A graph was loaded during bootstrap.
  //
  // And where did the model come from?
  // Whatever discovery determined.
  //
  // And how did discovery know where to look?
  // Yes, that is the question now
  //
  // What was discovery looking for?
  // Ingresses.
  //
  // Why was discovery looking for something?
  // Its job is to locate resources to engage with
  // they may have something to say
  //
  // We begin in a nullary position with respect to action.
  //
  // We deploy interpreters to incoming signals.
  //
  // The interpreters may spur us to action.
  //
  // Is this suggesting queue processing as a first-class process model?
  //
  // For a simple vocabulary that can describe useful processes (not dataflows,
  // but as simple as `listensTo`), what terms would we need?
  //
  // We can talk about frame simulations as sequences, but a frame simulation is
  // not a process.  It requires a process, to be iterated.
  //
  // We can't do anything without processes.
  //
  // But so far we haven't had a vocabulary for talking about them.
  //
  // I don't want MELD to have a “built-in” process model.
  //
  // Yet I'm not opposed to a *de facto* (core?) implementation
  //
  // One option would be to use CSP channels, and say that they must implement
  // some (Process) protocol, which may have other extensions by other types.
  //
  // To implement a protocol is to participate in polymorphism.  The mechanism
  // for polymorphism will be first-class if necessary, and should afford the
  // same power to all comers.
  //
  // We say that a thing can be “interpreted as a Process” if some registered
  // mechanism matches its description.
  //
  // We already have this for (pseudo-)RDF resources, by way of driver rules.
  //
  // But remember, driver rules are things.  So there SHOULD be some way to
  // RDF-ify them.
  //
  //

  const requested_model = window.location.search.replace(/^\?/, "");
  if (requested_model) show_example(requested_model);
  else {
    show_mind_map();
  }
}

main();
