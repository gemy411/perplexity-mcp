import { IChatRepository } from '../../domain/repositories/IChatRepository.js';
import { IAIService } from '../../domain/services/IAIService.js';
import { Chat } from '../../domain/entities/Chat.js';
import { Message } from '../../domain/entities/Message.js';
import { randomUUID } from 'crypto';

/**
 * Use case for chat-related operations
 */
export class ChatUseCase {
  constructor(
    private chatRepository: IChatRepository,
    private aiService: IAIService
  ) {}

  /**
   * Creates a new chat session
   * @returns The ID of the newly created chat
   */
  async createNewChat(): Promise<string> {
    const chatId = randomUUID();
    await this.chatRepository.createChat(new Chat(chatId));
    return chatId;
  }

  /**
   * Sends a message to the chat and gets a response
   * @param chatId The chat ID
   * @param content The message content
   * @returns The chat ID and AI response
   */
  async sendMessage(chatId: string, content: string): Promise<{ chatId: string, response: string }> {
    // Ensure chat exists or create a new one
    let chat = await this.chatRepository.getChatById(chatId);
    if (!chat) {
      await this.chatRepository.createChat(new Chat(chatId));
    }

    // Save the user message
    const userMessage = new Message(
      null,
      chatId,
      "user",
      content
    );
    await this.chatRepository.saveMessage(userMessage);

    // Get all messages for context
    const chatHistory = await this.chatRepository.getChatMessages(chatId);
    
    // Format messages for the AI service
    const formattedMessages = chatHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Get response from AI service
    const aiResponse = await this.aiService.generateResponse(formattedMessages);

    // Save the assistant message
    const assistantMessage = new Message(
      null,
      chatId,
      "assistant",
      aiResponse.content
    );
    await this.chatRepository.saveMessage(assistantMessage);

    return {
      chatId,
      response: aiResponse.content
    };
  }

  /**
   * Gets the message history for a chat
   * @param chatId The chat ID
   * @returns Array of messages
   */
  async getChatHistory(chatId: string): Promise<Message[]> {
    return this.chatRepository.getChatMessages(chatId);
  }
}
