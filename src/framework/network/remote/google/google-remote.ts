import { GoogleGenAI, Part } from "@google/genai";
import { SearchRemoteParams } from "../../../../adapters/models/search-remote-params.js";
import {
  Citation,
  SearchRemoteResult,
} from "../../../../adapters/models/search-remote-result.js";
import { SearchOnlineRemotePort } from "../../../../adapters/ports/search-online-remote.js";
import { Either, left, right } from "fp-ts/lib/Either.js";
import { pipe } from "fp-ts/lib/function.js";
import { match } from "fp-ts/lib/Option.js";

export enum GoogleModels {
  /**
   * Fast, cheap, and good for simple tasks.
   */
  GEMINI_FLASH = "gemini-2.5-flash",
  /**
   * For complex tasks, good for reasoning.
   */
  GEMINI_PRO = "gemini-2.5-pro",
}

export class GoogleRemote implements SearchOnlineRemotePort {
  async searchOnline(
    params: SearchRemoteParams
  ): Promise<Either<Error, SearchRemoteResult>> {
    console.log("GoogleRemote searchOnline params:", params);
    let query = params.query;
    let depth = params.depth;

    let modelName: string;
    switch (depth) {
      case "shallow":
        modelName = GoogleModels.GEMINI_FLASH;
        break;
      case "medium":
        modelName = GoogleModels.GEMINI_PRO;
        break;
      case "deep":
        modelName = GoogleModels.GEMINI_PRO;
        break;
    }
    console.log("Using Google Model:", modelName);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return left(new Error("Missing Gemini API key"));
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
    });

    const groundingTool = {
      googleSearch: {},
    };

    let maxOutputTokens: number;
    switch (depth) {
      case "shallow":
        maxOutputTokens = 4000;
        break;
      case "medium":
        maxOutputTokens = 4000;
        break;
      case "deep":
        maxOutputTokens = 10000;
        break;
    }

    try {
      if (!query.trim()) {
        return left(new Error("Search query cannot be empty"));
      }

      const generationConfig = {
        tools: [groundingTool],
        temperature: 1.0,
        maxOutputTokens: maxOutputTokens,
        systemInstruction: pipe(
          params.systemMessage,
          match(
            () => "",
            (systemMessage: string) => systemMessage
          )
        ),
      };
      const request = {
        model: modelName,
        contents: params.query,
        config: generationConfig,
      };
      console.log(
        "Sending messages to Google:",
        JSON.stringify(request, null, 2)
      );
    
      const response = await ai.models.generateContent(request);

      const candidate = response.candidates?.[0];

      if (!candidate || !candidate.content || !candidate.content.parts) {
        return left(
          new Error("No content found in Google Gemini API response")
        );
      }

      const textContent = candidate.content.parts
        .map((part: Part) => part.text)
        .join("");
        
        if (textContent) {
          const groundingMetadata = candidate.groundingMetadata;
          let citations: Citation[] = [];
  
          if (groundingMetadata?.groundingChunks) {
            citations = groundingMetadata.groundingChunks.map((chunk: any) => ({
              uri: chunk.web.uri,
              title: chunk.web.title,
            }));
          }
  
          const searchQueries = groundingMetadata?.webSearchQueries || [];
          const resultObj = new SearchRemoteResult(
            textContent,
            citations,
            searchQueries
          );
          console.log("GoogleRemote result:", resultObj);
          return right(resultObj);
        } else {
        const errorMessage = "No content found in Google Gemini API response";
        console.error(errorMessage);
        return left(new Error(errorMessage));
      }
    } catch (error) {
      const errorMessage = `Error: ${error instanceof Error ? error.message : String(error)}`;
      console.error(errorMessage);
      return left(new Error(errorMessage));
    }
  }
} 