import { error } from "console";
export enum RemoteMode {
    PPLX = "pplx",
    OpenRouter = "open_router"
}

export class RemoteModeFetcher {
    getRemoteMode() {
        if (process.env.OPEN_ROUTER_API_KEY && process.env.OPEN_ROUTER_API_KEY.length > 0) {
            return RemoteMode.OpenRouter
        } else if (process.env.PERPLEXITY_API_KEY && process.env.PERPLEXITY_API_KEY.length > 0) {
            return RemoteMode.PPLX
        } else {
            throw new Error("Must use at least one API key");
        }
    }
}