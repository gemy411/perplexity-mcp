import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SearchOnlineUseCase } from "../../usecase/search/search-online-usecase.js";
import { SearchOnlineParams } from "../../usecase/search/models/search-online-params.js";
import { fromNullable } from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js"
import { match } from "fp-ts/lib/Either.js"
export function addErrorFixingTool(server: McpServer, useCase: SearchOnlineUseCase) {
    server.tool(
        "pplx-error-fixing",
        "Error fixing tool to search for fixes of errors in code or command line.",
        {   
            query: z.string().describe("Search query to fix the error"),
            errorSnippet: z.string().optional().describe("Error snippet as a reference, use only what's relevant to the error"),
            depth: z.enum(["shallow", "medium", "deep"]).describe("Depth of the search, more depth equals more time and costs")
         },
        async ({ query, errorSnippet, depth }) => {
            const params = new SearchOnlineParams(query, fromNullable(errorSnippet), depth, "error_fix")
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