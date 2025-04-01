
import { Either } from "fp-ts/lib/Either.js";
import { SearchOnlinePort } from "./ports/search-online-port.js";
import { SearchOnlineParams } from "./models/search-online-params.js";
import { SearchResult } from "./models/search-online-results.js";

class SearchOnlineUseCase {
  constructor(
    private readonly port: SearchOnlinePort
  ) {}

  async execute(params: SearchOnlineParams): Promise<Either<Error, SearchResult>> {
    return await this.port.searchOnline(params);
  }
}

export { SearchOnlineUseCase };