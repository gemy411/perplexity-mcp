import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { AxiosInstance } from "axios";
import { z } from "zod";
import { PerplexityModel } from "../pplx/models.js";

export function addErrorFixingTool(server: McpServer, axiosInstance: AxiosInstance, model: PerplexityModel = PerplexityModel.SONAR) {
    server.tool(
        "pplx-error-fixing",
        "Error fixing tool to search for fixes of errors in code or command line.",
        {   
            query: z.string().describe("Search query to fix the error"),
            errorSnippet: z.string().optional().describe("Error snippet as a reference, use only what's relevant to the error")
         },
        async ({ query, errorSnippet }) => {
            try {
                // Simple input validation
                if (!query.trim()) {
                    return {
                        isError: true,
                        content: [{ type: "text", text: "Error: Search query cannot be empty" }]
                    };
                }
        
                const response = await axiosInstance.post("/chat/completions", {
                    model: model,
                    messages: [{ role: "user", content: `${query} ${errorSnippet ? `\n\nError Snippet:\n${errorSnippet}` : ""}` }],
                });
        
                return {
                    content: [{
                        type: "text",
                        text: response.data.choices[0].message.content
                    }]
                };
            } catch (error) {
                console.error("Error fixing tool failed:", error);
                return {
                    isError: true,
                    content: [{ type: "text", text: "Error: Failed to fix error" }]
                };
            }
        }
    );
}