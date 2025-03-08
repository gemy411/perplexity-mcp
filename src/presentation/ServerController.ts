import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { ToolRegistry } from './ToolRegistry.js';

/**
 * Controller for the MCP server
 */
export class ServerController {
  /**
   * Creates a new ServerController
   * @param server The MCP server instance
   * @param toolRegistry The tool registry
   */
  constructor(
    private server: Server,
    private toolRegistry: ToolRegistry
  ) {
    this.setupErrorHandling();
  }

  /**
   * Sets up error handling for the server
   */
  private setupErrorHandling(): void {
    // Set up error handler for the server
    this.server.onerror = (error) => {
      console.error("[MCP Error]", error);
    };

    // Set up process signal handlers
    process.on("SIGINT", async () => {
      await this.close();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      await this.close();
      process.exit(0);
    });
  }

  /**
   * Initializes the server
   */
  initialize(): void {
    // Register all tools
    this.toolRegistry.registerTools();
  }

  /**
   * Runs the server
   */
  async run(): Promise<void> {
    try {
      // Initialize the server
      this.initialize();
      
      // Connect to the transport
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      
      console.log("Perplexity MCP server started");
    } catch (error) {
      console.error("Failed to start server:", error);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to start server: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Closes the server and releases resources
   */
  async close(): Promise<void> {
    try {
      await this.server.close();
      console.log("Perplexity MCP server stopped");
    } catch (error) {
      console.error("Error while closing server:", error);
    }
  }
}
