import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";

const perplexityApiKey = process.env.PERPLEXITY_API_KEY;

// setup axios instance
const axiosInstance = axios.create({
  baseURL: "https://api.perplexity.ai",
  headers: {
    "Authorization": `Bearer ${perplexityApiKey}`,
    "Content-Type": "application/json"
  }
});

const server = new McpServer({
  name: "Perplexity MCP Server",
  version: "0.0.1"
});

server.tool(
  "search",
  "Search tool to get up to date responses on any topic. use it as online pair programmer. this is a search query, the more accurate and more context there is the better.",
  { query: z.string() },
  async ({ query }) => {
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
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);