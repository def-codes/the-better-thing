import { NamedNode, BlankNode } from "@def.codes/rdf-data-model";
import { factory } from "./factory";
import { RDFTripleStore } from "./rdf-triple-store";

type GraphName = NamedNode | BlankNode;

const { namedNode, blankNode } = factory;

const TYPE = namedNode("rdf:type"); // FAKE CURIE
const GRAPH = namedNode("rdfg:Graph"); // FAKE CURIE

// this is just intended to capture what's in the actual RDF 1.1 concepts doc
// in a way that isn't tied to a triple store implementation
// TEMP extend this class
interface IGraph extends RDFTripleStore {}

const rando = () => Math.round(Math.random() * 1e12);

// https://github.com/tc39/proposal-uuid
// https://stackoverflow.com/a/2117523
// can also use that with @thi.ng RNG's
const generate_iri = () => `http://def.codes/u/${rando()}-${rando()}`;

// TODO: use consistent naming
export class Dataset {
  readonly defaultGraph: IGraph = new RDFTripleStore();
  readonly namedGraphs: Map<GraphName, IGraph> = new Map();

  constructor(readonly base_iri?: string) {
    this.base_iri = base_iri || generate_iri();
  }

  get factory() {
    return factory;
  }

  namedGraph(name: GraphName): IGraph | undefined {
    return this.namedGraphs.get(name);
  }

  // TODO: What if this name is already used?
  // could change the contract so that this is ‘get or create’
  create_graph(name?: NamedNode): { name: NamedNode; graph: IGraph } {
    const graph = new RDFTripleStore();

    // record some info about the existence of this store
    name = name || namedNode(generate_iri());
    const predicate = TYPE;
    const object = GRAPH;

    this.namedGraphs.set(name, graph);
    this.defaultGraph.add([name, predicate, object]);

    return { name, graph };
  }

  // TODO: deprecate, this is a bad name
  // create(): IGraph {
  //   return this.create_graph().graph;
  // }
}
