import { error } from "console";

export enum RemoteMode {
    PPLX = "pplx",
    OpenRouter = "open_router"
}

export class RemoteModeFetcher {
    getRemoteMode() {
        if (process.env.OPEN_ROUTER_API_KEY) {
            return RemoteMode.OpenRouter
        } else if (process.env.PERPLEXITY_API_KEY) {
            return RemoteMode.PPLX
        } else {
            throw new Error("Must use atleast on API key");
        }
    }
}