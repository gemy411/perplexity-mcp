import Database from 'better-sqlite3';
import { ConfigManager, Config } from './config/Config.js';
import { SqliteChatRepository } from './database/SqliteChatRepository.js';
import { PerplexityAIService } from './api/PerplexityAIService.js';
import { IChatRepository } from '../domain/repositories/IChatRepository.js';
import { IAIService } from '../domain/services/IAIService.js';

/**
 * Factory for creating and connecting infrastructure components
 */
export class InfrastructureFactory {
  private config: Config;
  private db: Database.Database;
  private chatRepository: IChatRepository;
  private aiService: IAIService;

  constructor() {
    // Get configuration
    this.config = ConfigManager.getConfig();
    
    // Initialize database
    this.db = new Database(this.config.databasePath, { fileMustExist: false });
    
    // Create repositories
    this.chatRepository = new SqliteChatRepository(this.db);
    
    // Create services
    this.aiService = new PerplexityAIService(this.config.apiKey, this.config.model);
  }

  /**
   * Gets the chat repository
   * @returns The chat repository
   */
  getChatRepository(): IChatRepository {
    return this.chatRepository;
  }

  /**
   * Gets the AI service
   * @returns The AI service
   */
  getAIService(): IAIService {
    return this.aiService;
  }

  /**
   * Gets the database instance
   * @returns The database instance
   */
  getDatabase(): Database.Database {
    return this.db;
  }

  /**
   * Gets the configuration
   * @returns The configuration
   */
  getConfig(): Config {
    return this.config;
  }

  /**
   * Closes all resources
   */
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
    }
  }
}
