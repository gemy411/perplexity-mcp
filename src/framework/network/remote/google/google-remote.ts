import { SearchRemoteResult } from "../../../../adapters/models/search-remote-result.js";
import { SearchOnlineRemotePort } from "../../../../adapters/ports/search-online-remote.js";
import { Either, left, right } from "fp-ts/lib/Either.js";
import { pipe } from "fp-ts/lib/function.js";
import { match } from "fp-ts/lib/Option.js";
import { GoogleGenAI } from "@google/genai";
import { SearchRemoteParams } from "../../../../adapters/models/search-remote-params.js";

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
        maxOutputTokens = 10048;
        break;
      case "deep":
        maxOutputTokens = 20000;
        break;
    }

    const generationConfig = {
      tools: [groundingTool],
      maxOutputTokens: maxOutputTokens,
      systemInstruction: pipe(
        params.systemMessage,
        match(
          () => "",
          (systemMessage: string) => systemMessage
        )
      ),
    };

    try {
      if (!query.trim()) {
        return left(new Error("Search query cannot be empty"));
      }

      console.log(
        "Sending messages to Google:",
        JSON.stringify(generationConfig, null, 2)
      );
      const request = {
        model: modelName,
        contents: params.query,
        config: generationConfig,
      };
      
      const response = await ai.models.generateContent(request);
      const textContent = response.text;
      if (textContent) {
        return right(new SearchRemoteResult(textContent));
      } else {
        return left(new Error("No content found in Google Gemini API response"));
      }
    } catch (error) {
      console.error("Error processing search query:", error);
      return left(new Error(`Error: ${error instanceof Error ? error.message : String(error)}`));
    }
  }
} 