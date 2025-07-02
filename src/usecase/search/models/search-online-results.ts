import { Citation } from "../../../adapters/models/search-remote-result.js";

export class SearchResult {
  constructor(
    public message: string,
    public citations: Citation[],
    public searchQueries: string[]
  ) {}
}
