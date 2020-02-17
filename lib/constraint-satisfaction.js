// sketch of solver
const {
  persistent_monotonic_dictionary,
  ops: { has, assoc, size, parent },
} = require("./persistent-dictionary");

/*
From Patrick Winston lecture
https://www.youtube.com/watch?v=d1KyYyLmGpA

for each DFS assignment
  for each variable V[i] considered*
    for each x[i] in D[i]
      for each constraint C(x[i], x[j]) where D[j] ∋ x[j]
        if ∄ x[j] : C(x[j], x[i]) is satisfied
          remove x[i] from D[i]
     if D[i] empty
       backup
 */

// essentially a DFS strategy
//
// search as graph: each step is an edge representing an assignment of a value
// to a variable.
//
// RESTRICTION: NO RECURSION!
// support counting backtracks.
//   what is considered a backtrack?  a candidate assignment that fails.  i.e. a dead end
// support count constraing evaluations
//   but that can be done by hooking the eval function itelf
//   so this can be run with or without it
/**
 * @param {ReadonlyMap<string, ReadonlySet<any>>} problem.variables - a
 *   dictionary whose keys are the variables in the problem and whose values are
 *   their domains (as a set of values)
 * @param {readonly Constraint[]} problem.constraints - a collection of
 *   constraints where a constraint is the variables are filled by the
 *   assignment anything that can be evaluated w.r.t. an assignment
 * @param {(constraint: LogicExpression, assignment: object) => boolean}
 *   problem.evaluate - a function that acts as a predicate on a constraint
 *   given an assignment.  Note that the “actual” function may enclose any
 *   context it needs, e.g. for evaluation of functions/relations in the
 *   expression.  But since such a context would be consistent throughout the
 *   search, it is not exposed as such.
 */
function* constraint_satisfaction_search(problem_spec, state = {}) {
  //   you can determine whether a constraint is open or closed
  //   the type of supported/recognized expressions is where much of the variety/interest lies
  //   the specialization will lie in
  //   - how actions taken (test assignments and results of evaluations) affect next steps
  //   - heuristics available
  const { variables, domains, constraints, evaluate } = problem_spec;
  // assignment is a (partial) dictionary by variable.  candidate assignments.
  // in general, candidate assignments are not known to be good (part of an
  // ultimate solution consistent with the other assignments).
  // can we
  //
  //   (1) determine that some assignments must be good and
  //   (2) indicate this?
  //
  // the domain of each variable can be reduced as you eliminate possibilities,
  // but that is still subject to the assumptions in the other assignments.
  // Those domain restrictions can be rolled back as well.
  const { working_domains, working_constraints } = state;
  // Passing in assignment would allow resume
  let assignment = persistent_monotonic_dictionary();
  // Do we assume at each stage that the assignments are consistent?
  // by definition, the assignment being tried cannot be known to be good
  // likewise for the others
  //
  // These loops track (some) exploration state but at the cost of governing the
  // order in which things are tried.  This won't cut it for some strategies.
  for (const [variable, domain] of variables) {
    for (const value of domain) {
      // see below... you can still get parent value by popping to its prototype
      assignment = assoc(assignment, variable, value);

      // Is the assignment complete?
      if (size(assignment) === variables.length) {
        // all variables have assignments
      }

      let failed;
      // Are all of the constraints met?
      for (const constraint of constraints) {
        if (!evaluate(constraint, assignment)) {
          failed = constraint;
          break;
        }
      }

      if (failed) {
        // increment backtrack count?
        //
        // or is this a function of iterator?  i.e. a backtrack can be detected
        // whenever the size ofassignment is not greater than the previous one?
        //
        // backtrack last assignment?  you're going to do this anyway?
        //
        // and this exact combination
        // need to add to visited (but within this path)
      }

      // but what if this didn't fail?  then you don't backtrack.  you want to
      // now go deeper

      yield { assignment, failed };

      assignment = parent(assignment);
    }
  }
}

function* naive_dfs_non_recursive(problem) {
  const { variables } = problem;
  let assignment = persistent_monotonic_dictionary();
  const visited = new Set();

  // Return an arbitrary variable.  But strategy could change this.
  const select_unassigned = () => {
    for (const variable of variables.keys())
      if (!has(assignment, variable) && !visited.has(variable)) return variable;
  };

  const backtrack = () => (assignment = parent(assignment));

  while (true) {
    const variable = select_unassigned();
    if (!variable) break;
    // Get some value from the domain that hasn't been tried yet.
    for (const value of variables.get(variable)) {
      assignment = assoc(assignment, variable, value);
      // do something here
      const failed = false;
      if (failed) {
        backtrack();
      } else {
        continue;
      }
      backtrack();
    }
    break;
    // visited.add(variable);
  }

  // const queue = Array.from(variables.keys(), key => ({ path: [key] }));
  // while (queue.length) {
  //   const { path } = queue.pop();
  //   yield { assignment };
  // }
}

function* naive_dfs_recursive(
  problem,
  assignment = persistent_monotonic_dictionary()
) {
  const { variables } = problem;

  const select_unassigned = () => {
    for (const variable of variables.keys())
      if (!has(assignment, variable)) return variable;
  };

  yield { assignment };

  const variable = select_unassigned();

  if (!variable) return; // Everything is assigned

  for (const value of variables.get(variable)) {
    yield* naive_dfs_recursive(problem, assoc(assignment, variable, value));
  }
}

module.exports = { constraint_satisfaction_search, naive_dfs_recursive };
