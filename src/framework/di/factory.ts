import { SearchOnlinePortImpl } from "../../adapters/gateway/SearchOnlinePortImpl.js";
import { SearchOnlineUseCase } from "../../usecase/search/search-online-usecase.js";
import { PerplexityRemote } from "../network/remote/pplx/pplx-remote.js";

export const getSearchUseCase = () => {
    const searchOnlinePort = new SearchOnlinePortImpl(new PerplexityRemote());
    return new SearchOnlineUseCase(searchOnlinePort);
}