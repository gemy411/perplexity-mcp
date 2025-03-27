import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { AxiosInstance } from "axios";
import { z } from "zod";
import { PerplexityModel } from "../pplx/models.js";

export function addSearchTool(server: McpServer, axiosInstance: AxiosInstance, model: PerplexityModel = PerplexityModel.SONAR) {
    server.tool(
      "pplx-search",
      "Search tool to get up to date responses on any topic. use it as online pair programmer. this is a search query, the more accurate and more context there is the better.",
      { 
        query: z.string().describe("Search query"),
        code: z.string().optional().describe("Code as a reference, use only what's relevant to the search")
       },
      async ({ query, code }) => {
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
            messages: [{ role: "user", content: `${query} ${code ? `\n\nCode:\n${code}` : ""}` }],
          });
    
          return {
            content: [{
              type: "text",
              text: response.data.choices[0].message.content
            }]
          };
        } catch (error) {
          console.error("Error processing search query:", error);
          
          return {
            isError: true,
            content: [{ 
              type: "text", 
              text: `Error: ${error instanceof Error ? error.message : String(error)}` 
            }]
          };
        }
      }
    );
  }