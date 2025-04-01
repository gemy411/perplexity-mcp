import { PerplexityModel } from "./pplx-models.js";

export class PerplexityRequest {
  constructor(
    public query: string,
    public searchContentSize: "low" | "medium" | "high",
    public model: PerplexityModel,
  ) {}
}
