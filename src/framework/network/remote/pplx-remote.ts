import { SearchRemoteResult } from "../../../adapters/models/search-remote-result.js";
import { SearchOnlineRemotePort } from "../../../adapters/ports/search-online-remote.js";
import { Either } from "fp-ts/lib/Either.js";
import { left } from "fp-ts/lib/Either.js";
import { match} from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js";
import axios from "axios";
import { PerplexityModel } from "./models/pplx-models.js";
import { right } from "fp-ts/lib/Either.js";
import { SearchRemoteParams } from "../../../adapters/models/search-remote-params.js";

export class PerplexityRemote implements SearchOnlineRemotePort {
  async searchOnline(params: SearchRemoteParams): Promise<Either<Error, SearchRemoteResult>> {
    let query = params.query;
    let depth = params.depth;

    let model: PerplexityModel
    
    switch(depth) {
      case "shallow":
        model = PerplexityModel.SONAR;
        break;
      case "medium":
        model = PerplexityModel.SONAR;
        break;
      case "deep":
        model = PerplexityModel.SONAR_PRO;
        break;
    }

    let timeout;
    switch(depth) {
      case "shallow":
        timeout = 45000;
        break;
      case "medium":
        timeout = 60000;
        break;
      case "deep":
        timeout = 90000;
        break;
    }

    let searchContextSize: "low" | "medium" | "high" = "low";
    switch(depth) {
      case "shallow":
        searchContextSize = "medium";
        break;
      case "medium":
        searchContextSize = "high";
        break;
      case "deep":
        searchContextSize = "high";
        break;
    }
    let webSearchOptions= {
      search_context_size: searchContextSize
    }
    
    let axiosInstance = axios.create({
      baseURL: "https://api.perplexity.ai",
      headers: {
        "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json"
      },
      timeout: timeout
    });
    try {
      // Simple input validation
      if (!query.trim()) {
        return left(new Error("Search query cannot be empty"));
      }
      axiosInstance.interceptors.request.use(request => {
        console.log('Starting Request', request);
        return request;
      });
      
      axiosInstance.interceptors.response.use(response => {
        console.log('Response:', response);
        return response;
      });
      const messages = pipe(
        params.systemMessage, match(
        () => [{role: "user", content: `${query}`}],
        (result: string) => [{role: "system", content: result},{role: "user", content: `${query}`}],
      ));
      const response = await axiosInstance.post("/chat/completions", {
        model: model,
        messages: messages,
        web_search_options: webSearchOptions,
      });

      return right(new SearchRemoteResult(response.data.choices[0].message.content));
    } catch (error) {
      console.error("Error processing search query:", error);
      return left(new Error(`Error: ${error instanceof Error ? error.message : String(error)}`));
    }
  }
}