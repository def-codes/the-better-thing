import type { Dataset, PlanBuilder } from "sparql-engine";

export interface DatasetContext {
  readonly dataset: Dataset;
  readonly plan_builder: PlanBuilder;
}

export interface GraphIdentifier {
  readonly graph: "default" | { readonly iri: string };
}
