import type { Dataset, PlanBuilder } from "sparql-engine";

export interface DatasetContext {
  readonly dataset: Dataset;
  readonly plan_builder: PlanBuilder;
}
