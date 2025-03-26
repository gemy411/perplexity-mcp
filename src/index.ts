import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import axios, { AxiosInstance } from "axios";
import { addSearchTool } from "./tools/Search.js"; 
import { addErrorFixingTool } from "./tools/error-fixing.js";
import { PerplexityModel } from "./pplx/models.js";

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
// Handle server connection with basic error handling
const transport = new StdioServerTransport();
try {
  addSearchTool(server, axiosInstance, PerplexityModel.SONAR);
  addErrorFixingTool(server, axiosInstance, PerplexityModel.SONAR);
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