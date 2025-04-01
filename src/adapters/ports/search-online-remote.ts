import { Either } from "fp-ts/lib/Either.js";
import { SearchRemoteResult } from "../models/search-remote-result.js";
import { SearchRemoteParams } from "../models/search-remote-params.js";

export interface SearchOnlineRemotePort {
  searchOnline(params: SearchRemoteParams): Promise<Either<Error, SearchRemoteResult>>;
}
