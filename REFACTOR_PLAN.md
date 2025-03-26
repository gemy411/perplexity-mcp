# Perplexity MCP Server Refactoring Plan

## Current Code Analysis

The current implementation consists of a single `PerplexityServer` class that handles:

1. Server initialization and configuration
2. Database setup and queries
3. API calls to Perplexity
4. Tool registration and request handling
5. Error handling
6. Process management

This structure violates several SOLID principles and clean architecture guidelines:

- **Single Responsibility Principle (SRP)**: The class has multiple responsibilities
- **Open/Closed Principle (OCP)**: The code needs modification for every new tool
- **Dependency Inversion Principle (DIP)**: High-level modules depend on low-level modules directly
- **No clear separation of concerns**: Business logic, data access, and infrastructure are mixed

## Proposed Architecture

We'll refactor toward a clean architecture with layers:

```
┌─────────────────────────────────────────────────────────────┐
│                      Presentation Layer                      │
│  (API endpoints, tool handlers, request/response formatting) │
└───────────────────────────────┬─────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────┐
│                       Application Layer                      │
│    (Use cases, orchestration of domain objects/services)     │
└───────────────────────────────┬─────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────┐
│                        Domain Layer                          │
│       (Core business logic, entities, value objects)         │
└───────────────────────────────┬─────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────┐
│                    Infrastructure Layer                      │
│      (Database, external APIs, config management)            │
└─────────────────────────────────────────────────────────────┘
```

## Refactoring Steps

### 1. Domain Layer

#### 1.1. Create Domain Entities and Value Objects

```typescript
// src/domain/entities/Chat.ts
export class Chat {
  constructor(
    public readonly id: string,
    public readonly createdAt: Date = new Date()
  ) {}
}

// src/domain/entities/Message.ts
export class Message {
  constructor(
    public readonly id: number | null,
    public readonly chatId: string,
    public readonly role: "user" | "assistant",
    public readonly content: string,
    public readonly createdAt: Date = new Date()
  ) {}
}
```

#### 1.2. Create Domain Interfaces

```typescript
// src/domain/repositories/IChatRepository.ts
import { Chat } from '../entities/Chat';
import { Message } from '../entities/Message';

export interface IChatRepository {
  createChat(chat: Chat): Promise<void>;
  getChatById(id: string): Promise<Chat | null>;
  saveMessage(message: Message): Promise<Message>;
  getChatMessages(chatId: string): Promise<Message[]>;
}

// src/domain/services/IAIService.ts
export interface AIServiceResponse {
  content: string;
}

export interface IAIService {
  generateResponse(messages: Array<{role: string, content: string}>): Promise<AIServiceResponse>;
}
```

### 2. Infrastructure Layer

#### 2.1. Database Implementation

```typescript
// src/infrastructure/database/SqliteChatRepository.ts
import Database from 'better-sqlite3';
import { IChatRepository } from '../../domain/repositories/IChatRepository';
import { Chat } from '../../domain/entities/Chat';
import { Message } from '../../domain/entities/Message';

export class SqliteChatRepository implements IChatRepository {
  constructor(private db: Database.Database) {
    this.initializeDatabase();
  }

  private initializeDatabase() {
    // Implementation of database initialization
  }

  async createChat(chat: Chat): Promise<void> {
    // Implementation
  }

  async getChatById(id: string): Promise<Chat | null> {
    // Implementation
  }

  async saveMessage(message: Message): Promise<Message> {
    // Implementation
  }

  async getChatMessages(chatId: string): Promise<Message[]> {
    // Implementation
  }
}
```

#### 2.2. External API Implementation

```typescript
// src/infrastructure/api/PerplexityAIService.ts
import axios, { AxiosInstance } from 'axios';
import { IAIService, AIServiceResponse } from '../../domain/services/IAIService';

export class PerplexityAIService implements IAIService {
  private axiosInstance: AxiosInstance;

  constructor(apiKey: string) {
    this.axiosInstance = axios.create({
      baseURL: "https://api.perplexity.ai",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });
  }

  async generateResponse(messages: Array<{role: string, content: string}>): Promise<AIServiceResponse> {
    // Implementation
  }
}
```

#### 2.3. Configuration Management

```typescript
// src/infrastructure/config/Config.ts
import { join } from 'path';
import { homedir } from 'os';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

export interface Config {
  apiKey: string;
  databasePath: string;
  model: string;
}

export class ConfigManager {
  static getConfig(): Config {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      throw new Error("PERPLEXITY_API_KEY environment variable is required");
    }

    const dbPath = join(homedir(), ".perplexity-mcp", "chat_history.db");
    const dbDir = dirname(dbPath);
    if (!existsSync(dbDir)) {
      mkdirSync(dbDir);
    }

    return {
      apiKey,
      databasePath: dbPath,
      model: "sonar"
    };
  }
}
```

### 3. Application Layer

#### 3.1. Use Cases

```typescript
// src/application/useCases/ChatUseCase.ts
import { IChatRepository } from '../../domain/repositories/IChatRepository';
import { IAIService } from '../../domain/services/IAIService';
import { Chat } from '../../domain/entities/Chat';
import { Message } from '../../domain/entities/Message';

export class ChatUseCase {
  constructor(
    private chatRepository: IChatRepository,
    private aiService: IAIService
  ) {}

  async createNewChat(): Promise<string> {
    const chatId = crypto.randomUUID();
    await this.chatRepository.createChat(new Chat(chatId));
    return chatId;
  }

  async sendMessage(chatId: string, content: string): Promise<{ chatId: string, response: string }> {
    // Implementation
  }

  async getChatHistory(chatId: string): Promise<Message[]> {
    return this.chatRepository.getChatMessages(chatId);
  }
}

// Additional use cases for other tools...
// src/application/useCases/SearchUseCase.ts
// src/application/useCases/DocumentationUseCase.ts
// src/application/useCases/ApiFinderUseCase.ts
// src/application/useCases/CodeAnalysisUseCase.ts
```

### 4. Presentation Layer

#### 4.1. Tool Handlers

```typescript
// src/presentation/toolHandlers/ChatToolHandler.ts
import { ChatUseCase } from '../../application/useCases/ChatUseCase';

export class ChatToolHandler {
  constructor(private chatUseCase: ChatUseCase) {}

  async handle(args: { message: string; chat_id?: string }): Promise<{
    chat_id: string;
    response: string;
  }> {
    // Implementation
  }
}

// Similar handlers for other tools...
```

#### 4.2. Tool Registry

```typescript
// src/presentation/ToolRegistry.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ChatToolHandler } from './toolHandlers/ChatToolHandler';
// Import other tool handlers

export class ToolRegistry {
  constructor(
    private server: Server,
    private chatToolHandler: ChatToolHandler,
    // Other handlers...
  ) {}

  registerTools() {
    // Register tool definitions
    // Register tool handlers
  }
}
```

#### 4.3. Server Controller

```typescript
// src/presentation/ServerController.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ToolRegistry } from './ToolRegistry';

export class ServerController {
  constructor(
    private server: Server,
    private toolRegistry: ToolRegistry
  ) {
    this.setupErrorHandling();
  }

  private setupErrorHandling() {
    // Error handling code
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}
```

### 5. Dependency Injection

#### 5.1. Container Setup

```typescript
// src/di/container.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import Database from "better-sqlite3";
import { ConfigManager } from '../infrastructure/config/Config';
import { SqliteChatRepository } from '../infrastructure/database/SqliteChatRepository';
import { PerplexityAIService } from '../infrastructure/api/PerplexityAIService';
import { ChatUseCase } from '../application/useCases/ChatUseCase';
import { ChatToolHandler } from '../presentation/toolHandlers/ChatToolHandler';
import { ToolRegistry } from '../presentation/ToolRegistry';
import { ServerController } from '../presentation/ServerController';

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
  // Other use cases...
  
  // Presentation layer
  const chatToolHandler = new ChatToolHandler(chatUseCase);
  // Other handlers...
  
  const toolRegistry = new ToolRegistry(
    server,
    chatToolHandler,
    // Other handlers...
  );
  
  const serverController = new ServerController(server, toolRegistry);
  
  return {
    serverController,
    db,
    server
  };
}
```

### 6. Entry Point

```typescript
// src/index.ts
import { setupDependencies } from './di/container';

async function main() {
  const { serverController, db, server } = setupDependencies();
  
  // Setup process handlers
  process.on("SIGINT", async () => {
    db.close();
    await server.close();
    process.exit(0);
  });
  
  // Start the server
  await serverController.run();
}

main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
```

## Benefits of the Refactored Architecture

### 1. Adherence to SOLID Principles

- **Single Responsibility Principle**: Each class has a single purpose
- **Open/Closed Principle**: New tools can be added without modifying existing code
- **Liskov Substitution Principle**: Implementations can be swapped without breaking code
- **Interface Segregation Principle**: Interfaces are specific to client needs
- **Dependency Inversion Principle**: High-level modules depend on abstractions

### 2. Improved Maintainability

- Smaller, focused classes that are easier to understand
- Clear separation of concerns
- Reduced cognitive load when making changes

### 3. Enhanced Testability

- Dependencies can be mocked for unit testing
- Business logic can be tested in isolation from infrastructure

### 4. Better Reusability

- Components can be reused across different parts of the application
- Abstractions enable alternative implementations (e.g., different AI services)

### 5. Simplified Extension

- New tools can be added by creating new use cases and handlers
- Infrastructure can be changed without modifying business logic

## Implementation Strategy

1. Create the folder structure according to the clean architecture layers
2. Implement the domain layer first (entities and interfaces)
3. Create the infrastructure implementations
4. Develop the application use cases
5. Build the presentation layer components
6. Set up the dependency injection container
7. Refactor the entry point to use the new architecture
8. Incrementally migrate functionality, testing at each step

This phased approach allows for gradual refactoring with minimal disruption and risk.
