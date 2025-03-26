import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { AxiosInstance } from "axios";
import { z } from "zod";
import { PerplexityModel } from "../pplx/models.js";

export function addErrorFixingTool(server: McpServer, axiosInstance: AxiosInstance, model: PerplexityModel = PerplexityModel.SONAR) {
    server.tool(
        "pplx-error-fixing",
        "Error fixing tool to search for fixes of errors in code. this is a code snippet, the more accurate and more context there is the better.",
        { code: z.string() },
        async ({ code }) => {
            try {
                // Simple input validation
                if (!code.trim()) {
                    return {
                        isError: true,
                        content: [{ type: "text", text: "Error: Code cannot be empty" }]
                    };
                }
        
                const response = await axiosInstance.post("/chat/completions", {
                    model: model,
                    messages: [{ role: "user", content: `Fix the following code: ${code}` }],
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