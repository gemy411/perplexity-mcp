import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SearchOnlineUseCase } from "../../usecase/search/search-online-usecase.js";
import { fromNullable } from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js"
import { match } from "fp-ts/lib/Either.js"
import { SearchOnlineParams } from "../../usecase/search/models/search-online-params.js";

export function addSearchTool(server: McpServer, useCase: SearchOnlineUseCase) {
    server.tool(
      "search-online",
      "Search tool to get up to date responses on any topic. use it as online pair programmer. this is a search query, the more accurate and more context there is the better.",
      { 
        query: z.string().describe("Search query"),
        code: z.string().optional().describe("Code as a reference, use only what's relevant to the search"),
        depth: z.enum(["shallow", "medium", "deep"]).describe("Depth of the search, more depth equals more time and costs")
       },
      async ({ query, code, depth }) => {
        const params = new SearchOnlineParams(query, fromNullable(code), depth, "normal")
        const result = await useCase.execute(params)
        return pipe(result, match(
            (error) => ({
                isError: true,
                content: [{ 
                    type: "text", 
                    text: `Error: ${error instanceof Error ? error.message : String(error)}` 
                }]
            }),
            (result) => ({
                content: [{ 
                    type: "text", 
                    text: result.message 
                }]
            })
        ))
      }
    );
}