import { Either } from "fp-ts/lib/Either.js";
import { SearchOnlineParams } from "../models/search-online-params.js";
import { SearchResult } from "../models/search-online-results.js";

interface SearchOnlinePort {
  searchOnline(params: SearchOnlineParams): Promise<Either<Error, SearchResult>>;
}

export { SearchOnlinePort };