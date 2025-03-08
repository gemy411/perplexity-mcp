import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { ChatToolHandler } from './toolHandlers/ChatToolHandler.js';
import { SearchToolHandler } from './toolHandlers/SearchToolHandler.js';
import { DocumentationToolHandler } from './toolHandlers/DocumentationToolHandler.js';
import { ApiFinderToolHandler } from './toolHandlers/ApiFinderToolHandler.js';
import { CodeAnalysisToolHandler } from './toolHandlers/CodeAnalysisToolHandler.js';

/**
 * Registry for MCP tools and handlers
 */
export class ToolRegistry {
  constructor(
    private server: Server,
    private chatToolHandler: ChatToolHandler,
    private searchToolHandler: SearchToolHandler,
    private documentationToolHandler: DocumentationToolHandler,
    private apiFinderToolHandler: ApiFinderToolHandler,
    private codeAnalysisToolHandler: CodeAnalysisToolHandler
  ) {}

  /**
   * Registers all tools and their handlers with the MCP server
   */
  registerTools(): void {
    // Register tool definitions
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "chat_perplexity",
          description: "Maintains ongoing conversations with Perplexity AI. Creates new chats or continues existing ones with full history context.",
          inputSchema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                description: "The message to send to Perplexity AI"
              },
              chat_id: {
                type: "string",
                description: "Optional: ID of an existing chat to continue. If not provided, a new chat will be created."
              }
            },
            required: ["message"]
          }
        },
        {
          name: "search",
          description: "Perform a general search query to get comprehensive information on any topic",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The search query or question"
              },
              detail_level: {
                type: "string",
                description: "Optional: Desired level of detail (brief, normal, detailed)",
                enum: ["brief", "normal", "detailed"]
              }
            },
            required: ["query"]
          }
        },
        {
          name: "get_documentation",
          description: "Get documentation and usage examples for a specific technology, library, or API",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The technology, library, or API to get documentation for"
              },
              context: {
                type: "string",
                description: "Additional context or specific aspects to focus on"
              }
            },
            required: ["query"]
          }
        },
        {
          name: "find_apis",
          description: "Find and evaluate APIs that could be integrated into a project",
          inputSchema: {
            type: "object",
            properties: {
              requirement: {
                type: "string",
                description: "The functionality or requirement you're looking to fulfill"
              },
              context: {
                type: "string",
                description: "Additional context about the project or specific needs"
              }
            },
            required: ["requirement"]
          }
        },
        {
          name: "check_deprecated_code",
          description: "Check if code or dependencies might be using deprecated features",
          inputSchema: {
            type: "object",
            properties: {
              code: {
                type: "string",
                description: "The code snippet or dependency to check"
              },
              technology: {
                type: "string",
                description: "The technology or framework context (e.g., 'React', 'Node.js')"
              }
            },
            required: ["code", "technology"]
          }
        }
      ]
    }));

    // Register tool handlers
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const toolName = request.params.name;
      const args = request.params.arguments || {};

      switch (toolName) {
        case "chat_perplexity":
          return await this.chatToolHandler.handle(args as { message: string; chat_id?: string });
        
        case "search":
          return await this.searchToolHandler.handle(args as { 
            query: string; 
            detail_level?: 'brief' | 'normal' | 'detailed' 
          });
        
        case "get_documentation":
          return await this.documentationToolHandler.handle(args as { 
            query: string; 
            context?: string 
          });
        
        case "find_apis":
          return await this.apiFinderToolHandler.handle(args as { 
            requirement: string; 
            context?: string 
          });
        
        case "check_deprecated_code":
          return await this.codeAnalysisToolHandler.handle(args as { 
            code: string; 
            technology: string 
          });
        
        default:
          throw new Error(`Unknown tool: ${toolName}`);
      }
    });
  }
}
