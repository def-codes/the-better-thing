import type { PipelineStage, Bindings } from "sparql-engine";
import { rdf } from "sparql-engine";
import { Writer, DataFactory } from "n3";
import type { DatasetContext, GraphIdentifier } from "./api";

const { quad } = DataFactory;
const { fromN3 } = rdf;

export const graph_to_turtle = async (
  context: DatasetContext,
  source: GraphIdentifier
): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const writer = new Writer({ format: "text/turtle" });

    const select =
      source.graph === "default"
        ? `SELECT * WHERE { ?subject ?predicate ?object }`
        : `SELECT * WHERE { GRAPH <${source.graph.iri}> { ?subject ?predicate ?object } }`;

    const { plan_builder } = context;
    const iterator = plan_builder.build(select) as PipelineStage<Bindings>;
    iterator.subscribe(
      bindings => {
        const triple = bindings.toObject();

        const subject_term = fromN3(triple["?subject"]);
        const predicate_term = fromN3(triple["?predicate"]);
        const object_term = fromN3(triple["?object"]);

        writer.addQuad(quad(subject_term, predicate_term, object_term));
      },
      reject,
      () => {
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
