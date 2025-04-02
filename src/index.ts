import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getSearchUseCase } from "./framework/di/factory.js";
import { addErrorFixingTool } from "./tools/error-fixing.js";
import { addSearchTool } from "./tools/Search.js";

const server = new McpServer({
  name: "Perplexity MCP Server",
  version: "0.0.1"
});
// Handle server connection with basic error handling
const transport = new StdioServerTransport();
try {
  const useCase = getSearchUseCase()
  addSearchTool(server, useCase);
  addErrorFixingTool(server, useCase);
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

const searchUseCase = getSearchUseCase();
// console.log(searchUseCase.execute({ query: "fs-ts/Option package not found", code: none, depth: "medium", mode: "error_fix" }).then(result => console.log(result)).catch(error => console.error(error)));