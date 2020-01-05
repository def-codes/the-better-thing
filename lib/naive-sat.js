// adapted from http://russfrank.us/static/backtrack/backtrack.html
/* model is a set of variable assignments. */
const solve = (variables, clauses, model = Object.create(null)) => {
  let done = true;
  for (const clause of clauses) {
    const satisfied = satisfiable(clause, model);
    if (satisfied === false) return false;
    if (satisfied === undefined) done = false;
  }
  if (done) return model;

  const choice = variables.find(variable => model[variable] === undefined);
  if (!choice) return false;

  return (
    solve(variables, clauses, extend(model, choice, true)) ||
    solve(variables, clauses, extend(model, choice, false))
  );
};

const extend = (model, choice, value) =>
  Object.assign(Object.create(model), { [choice]: value });

/* Determines whether a clause is satisfiable given a certain model. */
const satisfiable = (clause, model) => {
  for (const variable of clause) {
    const value = resolve(variable, model);
    if (value === true) return true;
    if (value === undefined) return undefined;
  }
  return false;
};

/* Resolve some variable to its actual value, or undefined. */
const resolve = ({ variable, neg }, model) => {
  const val = model[variable];
  return val === undefined ? undefined : neg ? !val : val;
};

module.exports = { solve };
