define([
  "@def.codes/rstream-query-rdf",
  "@def.codes/meld-core",
  "./union-interpreter.js",
], ({ Dataset }, { q }, { make_interpreter }) => {
  const dataset = new Dataset();
  const { graph: recipe } = dataset.create_graph();
  // const b = dataset.create_graph();
  // const union = new UnionGraph(a, b);
  recipe.into(q("Alice isa Woman", "Bob isa Man", "Man subclassOf Peron"));

  const drivers = ["owlBasicDriver", "streamDriver", "subscriptionDriver"];
  const interpreter = make_interpreter(recipe, { drivers });
  const { reservoir, union, system } = interpreter;
  console.log(
    "reservoir",
    ...reservoir.triples.map(([s, p, o]) => `${s} ${p} ${o}\n`)
  );
});
