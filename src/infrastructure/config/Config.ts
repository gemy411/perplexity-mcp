import { join } from 'path';
import { homedir } from 'os';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

/**
 * Configuration interface
 */
export interface Config {
  apiKey: string;
  databasePath: string;
  model: string;
}

/**
 * Configuration manager
 */
export class ConfigManager {
  /**
   * Gets the application configuration
   * @returns The configuration
   */
  static getConfig(): Config {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      throw new Error("PERPLEXITY_API_KEY environment variable is required");
    }

    const dbPath = join(homedir(), ".perplexity-mcp", "chat_history.db");
    const dbDir = dirname(dbPath);
    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true });
    }

    return {
      apiKey,
      databasePath: dbPath,
      model: "sonar-reasoning-pro"
    };
  }
}
