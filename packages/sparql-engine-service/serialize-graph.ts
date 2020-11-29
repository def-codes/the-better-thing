import type {
  Graph,
  PlanBuilder,
  PipelineStage,
  Bindings,
} from "sparql-engine";
import { DataFactory, Writer } from "n3";

const { namedNode, literal, blankNode, quad } = DataFactory;

// Maybe there's a better way to do this.  N3 requires you to use the
// constructed object, even though the plain data objects are already in an
// informationally-equivalent form.
const n3_term = term => {
  if (term.nodeType === "NamedNode") return namedNode(term.value);
  if (term.nodeType === "BlankNode") return blankNode(term.value);
  if (term.nodeType === "Literal") return literal(term.value);
};

export const graph_to_turtle = async (
  graph: Graph,
  plan_builder: PlanBuilder
): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const writer = new Writer({ format: "text/turtle" });

    // TODO: Does this work for the default graph, too? i.e. does it always have an IRI?
    // const select = `SELECT * WHERE { GRAPH <${graph.iri}> { ?subject ?predicate ?object } }`;
    const select = `SELECT * WHERE { ?subject ?predicate ?object }`;

    const iterator = plan_builder.build(select) as PipelineStage<Bindings>;
    iterator.subscribe(
      bindings => {
        const triple = bindings.toObject();
        console.log(`triple`, triple);
        const subject = n3_term(triple["?subject"]);
        const predicate = n3_term(triple["?predicate"]);
        const object = n3_term(triple["?object"]);
        // writer.addQuad(quad(subject, predicate, object));
      },
      error => {
        console.log(`ERROR`, error);
        reject(error);
      },
      () => {
        console.log(`DONE`);

        writer.end((error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
      }
    );

    // The simplest thing would be to do a `find` on an open pattern.  However,
    // I'm using a levelgraph adapter that doesn't currently implement `find` as
    // such, though it does implement `evalBGP`.  So I can do an equivalent
    // SELECT query, which involves a bit more mapping.
    /*
    Pipeline.getInstance().forEach(
      graph.find({ subject: null, predicate: null, object: null }),
      triple => {
        n3_triples.push(toN3(triple));
      }
    );
*/
  });
};
