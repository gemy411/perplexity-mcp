import { error } from "console";
export enum RemoteMode {
    PPLX = "pplx",
    OpenRouter = "open_router",
    Google = "google"
}

export class RemoteModeFetcher {
    getRemoteMode() {
        if (process.env.OPEN_ROUTER_API_KEY && process.env.OPEN_ROUTER_API_KEY.length > 0) {
            return RemoteMode.OpenRouter
        } else if (process.env.PERPLEXITY_API_KEY && process.env.PERPLEXITY_API_KEY.length > 0) {
            return RemoteMode.PPLX
        } else if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 0) {
            return RemoteMode.Google
        } else {
            throw new Error("Must use at least one API key");
        }
    }
}