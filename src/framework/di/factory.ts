import { SearchOnlinePortImpl } from "../../adapters/gateway/SearchOnlinePortImpl.js";
import { SearchOnlineRemotePort } from "../../adapters/ports/search-online-remote.js";
import { SearchOnlineUseCase } from "../../usecase/search/search-online-usecase.js";
import { OpenRouterRemote } from "../network/remote/open_router/open-router-remote.js";
import { PerplexityRemote } from "../network/remote/pplx/pplx-remote.js";
import { RemoteMode, RemoteModeFetcher } from "../stored-pref-fetcher.js";
import { GoogleRemote } from "../network/remote/google/google-remote.js";

export const getSearchUseCase = () => {
    const remoteMode = new RemoteModeFetcher().getRemoteMode()
    console.log("Remote mode: ", remoteMode)
    let remote: SearchOnlineRemotePort
    switch(remoteMode) {
            case RemoteMode.OpenRouter: 
            remote = new OpenRouterRemote()
            break;
            case RemoteMode.PPLX:
            remote = new PerplexityRemote()
            break;
            case RemoteMode.Google:
            remote = new GoogleRemote()
            break;
            default: 
            remote = new PerplexityRemote()
        }
    const searchOnlinePort = new SearchOnlinePortImpl(remote);
    return new SearchOnlineUseCase(searchOnlinePort);
}