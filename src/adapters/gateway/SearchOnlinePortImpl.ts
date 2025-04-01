import { SearchOnlinePort } from "../../usecase/search/ports/search-online-port.js";
import { SearchOnlineParams } from "../../usecase/search/models/search-online-params.js";
import { SearchResult } from "../../usecase/search/models/search-online-results.js";
import { Either, map } from 'fp-ts/lib/Either.js';
import { toNullable }  from 'fp-ts/lib/Option.js';
import { pipe } from 'fp-ts/lib/function.js'
import { SearchRemoteParams } from "../models/search-remote-params.js";
import { SearchOnlineRemotePort } from "../ports/search-online-remote.js";
import { some } from "fp-ts/lib/Option.js";

export class SearchOnlinePortImpl implements SearchOnlinePort {
  constructor(
    private readonly searchOnlineRemotePort: SearchOnlineRemotePort
  ) {}
  async searchOnline(params: SearchOnlineParams): Promise<Either<Error, SearchResult>> {
    let code = toNullable(params.code);
    let query = `${params.query} ${code? `Code: ${code}` : ""}`
    let remoteParams = new SearchRemoteParams(query, some("be percise, you are talking to a machine only generate pure content") ,params.depth);
    return pipe(
      await this.searchOnlineRemotePort.searchOnline(remoteParams),
      map((result) => new SearchResult(result.message))
    );
  }
}
