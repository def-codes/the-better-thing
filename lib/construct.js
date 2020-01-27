const {
  RDFTripleStore,
  sync_query,
  factory,
} = require("@def.codes/rstream-query-rdf");
const { simply_entailable_units } = require("./atomize");
const { is_ground_triple } = require("./rdf-operations");
const { simple_bnode_mapping } = require("./simple-bnode-mapping");

const map_memoize = (f, map = new Map()) => x => {
  if (map.has(x)) return map.get(x);
  const minted = f(x);
  map.set(x, minted);
  return minted;
};

/*
  Side-effecting procedure for putting the results of a collection of
  SPARQL-CONSTRUCT-like query into a store.

  We need the source and target as *stores* so that we can correctly marshal
  blank nodes.  The result is treated as “derivative” of the source if they
  share a blank node space.  In any case, care must be taken to correctly handle
  blank nodes from multiple spaces (since templates have their own scope).
*/
const construct = (queries, source_store, target_store) => {
  const intermediate = new RDFTripleStore([], target_store.blank_node_space_id);

  // Whether blank nodes are shared between the source and target.
  const shared =
    source_store.blank_node_space_id === target_store.blank_node_space_id;

  const target_mint = () => target_store.mint();

  const unmap_source = map => value => {
    for (const [key, v] in map) if (value === v) return key;
  };

  const smap = new Map();

  const skolem = () =>
    factory.namedNode(`genid/${Math.round(Math.random() * 1e9)}`);

  // Maps blank nodes in the source to (possibly new) blank nodes in the target.
  const map_source_bnode = map_memoize(() => {
    return shared ? skolem() : target_mint();
  }, smap);

  // In SPARQL, you can elide WHERE when CONSTRUCT is equivalent.
  for (const { construct, where = construct } of queries) {
    // Atomize the template (once).  This breaks up the template into parts
    // without mutual dependencies among blank nodes.  Variables will not affect
    // this structure, even if they are filled by a blank node from the record,
    // because they cannot have mutual dependencies with the template's
    // bnodes.

    /// CAN YOU SAY THAT MORE SIMPLY, AND/OR PROVE IT?
    const atomized = simply_entailable_units(construct);
    const template_parts = atomized.output;

    const matches = sync_query(source_store, where) || [];

    for (const record of matches) {
      for (const { subgraph: template, ground } of template_parts) {
        // Now we're at the smallest unit.  Either we're going to pass something
        // in the shape of the template to the target or determine that it already
        // entails its equivalent.

        // Each template instance has its own distinct blank node scope.
        const map_template_bnode = map_memoize(target_mint);

        const master_mapping = term => {
          // Resolve variables from the matched antecedent (where)
          if (term.termType === "Variable") {
            const name = term.value;
            const value = record.hasOwnProperty(name) && record[name];
            return !value
              ? term // return unresolved variables as-is
              : value.termType === "BlankNode"
              ? map_source_bnode(value)
              : value;
          }

          // Slightly excessive.  This unconditionally mints blank nodes for the
          // template against the target space.  This is necessary when the
          // template needs to be instantiated.  If the bound template (modulo
          // this) is already entailed by the target, then this won't quite have
          // been needed, since the entailment mapping already accounts for
          // blank nodes in the candidate graph.  But it would still be
          // necessary to ensure that we avoid conflict with the blank nodes
          // coming from the record.
          return term.termType === "BlankNode"
            ? map_template_bnode(term)
            : term;
        };

        const bound = template.map(triple => triple.map(master_mapping));

        // Kind of an optimization.  Theoretically, we'd always have a mapping, in
        // which named nodes and literals would map to themselves.  This way, we
        // avoid unnecessary entailment tests.
        if (bound.every(is_ground_triple)) intermediate.into(bound);
        // The template has blank nodes, which should now have been "skolemized"
        else {
          const incoming = new RDFTripleStore(bound);

          // Entail against the intermediate store to minimize bnode creation.
          const mapping = simple_bnode_mapping(intermediate, incoming).output;

          // The template is already safely instantiated by the mapping, which
          // see.  else no-op: assert invariant the mapped bound node is in target
          if (mapping.size === 0) intermediate.into(bound);
        }
      }
    }
    // assert: blank nodes maintain provenance invariants.
  }

  // HACK.  should use 2-way index
  const unskolemize = triples =>
    triples.map(triple =>
      triple.map(term => {
        if (term.termType === "NamedNode" && term.value.startsWith("genid/"))
          for (const [key, v] of smap) if (term === v) return key;
        return term;
      })
    );

  target_store.into(unskolemize(intermediate.triples));
};

module.exports = { construct };
