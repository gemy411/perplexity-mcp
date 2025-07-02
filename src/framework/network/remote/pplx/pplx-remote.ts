import {
  Citation,
  SearchRemoteResult,
} from "../../../../adapters/models/search-remote-result.js";
import { SearchOnlineRemotePort } from "../../../../adapters/ports/search-online-remote.js";
import { Either } from "fp-ts/lib/Either.js";
import { left } from "fp-ts/lib/Either.js";
import { match} from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js";
import axios from "axios";
import { PerplexityModel } from "./models/pplx-models.js";
import { right } from "fp-ts/lib/Either.js";
import { SearchRemoteParams } from "../../../../adapters/models/search-remote-params.js";

export class PerplexityRemote implements SearchOnlineRemotePort {
  async searchOnline(params: SearchRemoteParams): Promise<Either<Error, SearchRemoteResult>> {
    let query = params.query;
    let depth = params.depth;

    // Determine model based on depth
    let model: PerplexityModel
    switch(depth) {
      case "shallow":
        model = PerplexityModel.SONAR;
        break;
      case "medium":
        model = PerplexityModel.SONAR_PRO;
        break;
      case "deep":
        model = PerplexityModel.SONAR_REASONING_PRO;
        break;
    }

    // Determine timeout based on depth
    let timeout;
    switch(depth) {
      case "shallow":
        timeout = 45000;
        break;
      case "medium":
        timeout = 60000;
        break;
      case "deep":
        timeout = 120000;
        break;
    }

    // Determine search context size based on depth
    let searchContextSize: "low" | "medium" | "high" = "low";
    switch(model) {
      case PerplexityModel.SONAR:
        searchContextSize = "medium";
        break;
      case PerplexityModel.SONAR_PRO:
        searchContextSize = "medium";
        break;
      case PerplexityModel.SONAR_REASONING_PRO:
        searchContextSize = "high";
        break;
    }
    
    // Check for missing API key
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      return left(new Error("Missing Perplexity API key"));
    }
    // Create axios instance
    let axiosInstance = axios.create({
      baseURL: "https://api.perplexity.ai",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      timeout: timeout
    });
    try {
      // Simple input validation
      if (!query.trim()) {
        return left(new Error("Search query cannot be empty"));
      }
      // Add request and response logging
      axiosInstance.interceptors.request.use(request => {
        console.log('Starting Request', request);
        return request;
      });
      
      axiosInstance.interceptors.response.use(response => {
        console.log('Response:', response);
        return response;
      });
      // Build messages
      // if system message is none, use default
      const messages = pipe(
        params.systemMessage, match(
        () => [{role: "user", content: `${query}`}],
        (result: string) => [{role: "system", content: result},{role: "user", content: `${query}`}],
      ));
      // Call Perplexity API
      const response = await axiosInstance.post("/chat/completions", {
        model: model,
        messages: messages,
        web_search_options: {search_context_size: searchContextSize},
      });

      const choice = response.data.choices[0];
      const message = choice.message;

      const citations: Citation[] =
        response.data.citations?.map((citation: any) => ({
          uri: citation.url,
          title: citation.title,
        })) || [];
      const searchQueries = response.data.search_queries || [];

      const resultObj = new SearchRemoteResult(message.content, citations, searchQueries)
      console.log("PerplexityRemote result:", resultObj);
      return right(resultObj);
    } catch (error) {
      const errorMessage = `Error: ${error instanceof Error ? error.message : String(error)}`;
      console.error(errorMessage);
      return left(new Error(errorMessage));
    }
  }
}