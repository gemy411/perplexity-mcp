import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import Database from "better-sqlite3";
import { ConfigManager } from '../infrastructure/config/Config.js';
import { SqliteChatRepository } from '../infrastructure/database/SqliteChatRepository.js';
import { PerplexityAIService } from '../infrastructure/api/PerplexityAIService.js';
import { ChatUseCase } from '../application/useCases/ChatUseCase.js';
import { SearchUseCase } from '../application/useCases/SearchUseCase.js';
import { DocumentationUseCase } from '../application/useCases/DocumentationUseCase.js';
import { ApiFinderUseCase } from '../application/useCases/ApiFinderUseCase.js';
import { CodeAnalysisUseCase } from '../application/useCases/CodeAnalysisUseCase.js';
import { ChatToolHandler } from '../presentation/toolHandlers/ChatToolHandler.js';
import { SearchToolHandler } from '../presentation/toolHandlers/SearchToolHandler.js';
import { DocumentationToolHandler } from '../presentation/toolHandlers/DocumentationToolHandler.js';
import { ApiFinderToolHandler } from '../presentation/toolHandlers/ApiFinderToolHandler.js';
import { CodeAnalysisToolHandler } from '../presentation/toolHandlers/CodeAnalysisToolHandler.js';
import { ToolRegistry } from '../presentation/ToolRegistry.js';
import { ServerController } from '../presentation/ServerController.js';

/**
 * Sets up all dependencies for the application
 * @returns An object containing all the dependencies
 */
export function setupDependencies() {
  // Configuration
  const config = ConfigManager.getConfig();
  
  // Infrastructure layer
  const db = new Database(config.databasePath, { fileMustExist: false });
  const chatRepository = new SqliteChatRepository(db);
  const aiService = new PerplexityAIService(config.apiKey);
  
  // MCP server
  const server = new Server(
    {
      name: "perplexity-server",
      version: "0.1.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );
  
  // Application layer
  const chatUseCase = new ChatUseCase(chatRepository, aiService);
  const searchUseCase = new SearchUseCase(aiService);
  const documentationUseCase = new DocumentationUseCase(aiService);
  const apiFinderUseCase = new ApiFinderUseCase(aiService);
  const codeAnalysisUseCase = new CodeAnalysisUseCase(aiService);
  
  // Presentation layer
  const chatToolHandler = new ChatToolHandler(chatUseCase);
  const searchToolHandler = new SearchToolHandler(searchUseCase);
  const documentationToolHandler = new DocumentationToolHandler(documentationUseCase);
  const apiFinderToolHandler = new ApiFinderToolHandler(apiFinderUseCase);
  const codeAnalysisToolHandler = new CodeAnalysisToolHandler(codeAnalysisUseCase);
  
  const toolRegistry = new ToolRegistry(
    server,
    chatToolHandler,
    searchToolHandler,
    documentationToolHandler,
    apiFinderToolHandler,
    codeAnalysisToolHandler
  );
  
  const serverController = new ServerController(server, toolRegistry);
  
  return {
    serverController,
    db,
    server
  };
}
