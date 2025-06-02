import { SearchRemoteResult } from "../../../../adapters/models/search-remote-result.js";
import { SearchOnlineRemotePort } from "../../../../adapters/ports/search-online-remote.js";
import { Either } from "fp-ts/lib/Either.js";
import { left } from "fp-ts/lib/Either.js";
import { match} from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js";
import axios from "axios";
import { right } from "fp-ts/lib/Either.js";
import { SearchRemoteParams } from "../../../../adapters/models/search-remote-params.js";
import { getOrElse } from "fp-ts/lib/Option.js";
import { OpenRouterModels } from "./models/open-router-models.js";

export class PerplexityRemote implements SearchOnlineRemotePort {
  async searchOnline(params: SearchRemoteParams): Promise<Either<Error, SearchRemoteResult>> {
    let query = params.query;
    let depth = params.depth;

    // Determine model based on depth
    let model: OpenRouterModels
    switch(depth) {
      case "shallow":
        model = OpenRouterModels.SONAR;
        break;
      case "medium":
        model = OpenRouterModels.SONAR_PRO;
        break;
      case "deep":
        model = OpenRouterModels.SONAR_REASONING;
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

    // Check for missing API key
    const apiKey = process.env.OPEN_ROUTER_API_KEY;
    if (!apiKey) {
      return left(new Error("Missing Openrouter API key"));
    }
    // Create axios instance
    let axiosInstance = axios.create({
      baseURL: "https://openrouter.ai/api/v1",
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
      const userMessage = {
        role: "user",
        content: [
          {
            type: "text",
            text: query
          }
        ]
      }
      const systemMessage = (): {
        role: string;
        content: {
          type: string;
          text: string;
        }[];
      } => ({
        role: "system",
        content: [
          {
            type: "text",
            text: pipe(
              params.systemMessage,
              getOrElse(() => " ")
            )
          }
        ]

      })
      const messages = pipe(
        params.systemMessage, match(
          () => [userMessage],
          () => [
            systemMessage(),
            userMessage
          ],
        ));
      // Call Perplexity API
      const response = await axiosInstance.post("/chat/completions", {
        model: model,
        messages: messages,
      });
      return right(new SearchRemoteResult(response.data.choices[0].message.content));
    } catch (error) {
      console.error("Error processing search query:", error);
      return left(new Error(`Error: ${error instanceof Error ? error.message : String(error)}`));
    }
  }
}