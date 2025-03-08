import Database from 'better-sqlite3';
import { IChatRepository } from '../../domain/repositories/IChatRepository.js';
import { Chat } from '../../domain/entities/Chat.js';
import { Message } from '../../domain/entities/Message.js';

/**
 * Interface for chat database row
 */
interface ChatRow {
  id: string;
  created_at: string;
}

/**
 * Interface for message database row
 */
interface MessageRow {
  id: number;
  chat_id: string;
  role: string;
  content: string;
  created_at: string;
}

/**
 * SQLite implementation of the IChatRepository interface
 */
export class SqliteChatRepository implements IChatRepository {
  constructor(private db: Database.Database) {
    this.initializeDatabase();
  }

  /**
   * Initialize the database schema
   */
  private initializeDatabase(): void {
    // Create chats table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS chats (
        id TEXT PRIMARY KEY,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create messages table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (chat_id) REFERENCES chats(id)
      )
    `);
  }

  /**
   * Creates a new chat
   * @param chat The chat to create
   */
  async createChat(chat: Chat): Promise<void> {
    this.db.prepare(
      "INSERT OR IGNORE INTO chats (id, created_at) VALUES (?, ?)"
    ).run(chat.id, chat.createdAt.toISOString());
  }

  /**
   * Gets a chat by its ID
   * @param id The chat ID
   * @returns The chat if found, null otherwise
   */
  async getChatById(id: string): Promise<Chat | null> {
    const row = this.db.prepare(
      "SELECT id, created_at FROM chats WHERE id = ?"
    ).get(id) as ChatRow | undefined;

    if (!row) {
      return null;
    }

    return new Chat(
      row.id,
      new Date(row.created_at)
    );
  }

  /**
   * Saves a message to a chat
   * @param message The message to save
   * @returns The saved message with its ID
   */
  async saveMessage(message: Message): Promise<Message> {
    // Ensure chat exists
    await this.ensureChatExists(message.chatId);

    const result = this.db.prepare(
      "INSERT INTO messages (chat_id, role, content, created_at) VALUES (?, ?, ?, ?)"
    ).run(
      message.chatId,
      message.role,
      message.content,
      message.createdAt.toISOString()
    );

    return new Message(
      result.lastInsertRowid as number,
      message.chatId,
      message.role,
      message.content,
      message.createdAt
    );
  }

  /**
   * Gets all messages for a chat
   * @param chatId The chat ID
   * @returns Array of messages
   */
  async getChatMessages(chatId: string): Promise<Message[]> {
    const rows = this.db.prepare(
      "SELECT id, chat_id, role, content, created_at FROM messages WHERE chat_id = ? ORDER BY created_at ASC"
    ).all(chatId) as MessageRow[];

    return rows.map(row => new Message(
      row.id,
      row.chat_id,
      row.role as "user" | "assistant",
      row.content,
      new Date(row.created_at)
    ));
  }

  /**
   * Helper method to ensure a chat exists before adding messages
   * @param chatId The chat ID
   */
  private async ensureChatExists(chatId: string): Promise<void> {
    const chat = await this.getChatById(chatId);
    if (!chat) {
      await this.createChat(new Chat(chatId));
    }
  }
}
