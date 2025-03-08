import { Chat } from '../entities/Chat.js';
import { Message } from '../entities/Message.js';

/**
 * Interface for chat repository operations
 */
export interface IChatRepository {
  /**
   * Creates a new chat
   * @param chat The chat to create
   */
  createChat(chat: Chat): Promise<void>;
  
  /**
   * Gets a chat by its ID
   * @param id The chat ID
   * @returns The chat if found, null otherwise
   */
  getChatById(id: string): Promise<Chat | null>;
  
  /**
   * Saves a message to a chat
   * @param message The message to save
   * @returns The saved message with its ID
   */
  saveMessage(message: Message): Promise<Message>;
  
  /**
   * Gets all messages for a chat
   * @param chatId The chat ID
   * @returns Array of messages
   */
  getChatMessages(chatId: string): Promise<Message[]>;
}
