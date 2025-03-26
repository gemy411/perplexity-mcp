import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";

// Check for API key
const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
if (!perplexityApiKey) {
  console.error("Error: PERPLEXITY_API_KEY environment variable is not set");
  process.exit(1);
}

// Setup axios instance
const axiosInstance = axios.create({
  baseURL: "https://api.perplexity.ai",
  headers: {
    "Authorization": `Bearer ${perplexityApiKey}`,
    "Content-Type": "application/json"
  },
  timeout: 30000 // 30 second timeout
});

const server = new McpServer({
  name: "Perplexity MCP Server",
  version: "0.0.1"
});

server.tool(
  "pplx-search",
  "Search tool to get up to date responses on any topic. use it as online pair programmer. this is a search query, the more accurate and more context there is the better.",
  { query: z.string() },
  async ({ query }) => {
    try {
      // Simple input validation
      if (!query.trim()) {
        return {
          isError: true,
          content: [{ type: "text", text: "Error: Search query cannot be empty" }]
        };
      }

      const response = await axiosInstance.post("/chat/completions", {
        model: "sonar",
        messages: [{ role: "user", content: query }],
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

// Handle server connection with basic error handling
const transport = new StdioServerTransport();
try {
  await server.connect(transport);
} catch (error) {
  console.error("Failed to connect to transport:", error);
  process.exit(1);
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});