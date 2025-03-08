import { ChatUseCase } from '../../application/useCases/ChatUseCase.js';

/**
 * Handler for the chat_perplexity tool
 */
export class ChatToolHandler {
  constructor(private chatUseCase: ChatUseCase) {}

  /**
   * Handles a chat request
   * @param args The request arguments
   * @returns The chat ID and response
   */
  async handle(args: { message: string; chat_id?: string }): Promise<{
    chat_id: string;
    response: string;
  }> {
    try {
      const { message, chat_id } = args;
      
      // If no chat_id is provided, create a new chat
      const chatId = chat_id || await this.chatUseCase.createNewChat();
      
      // Send the message and get the response
      const result = await this.chatUseCase.sendMessage(chatId, message);
      
      return {
        chat_id: result.chatId,
        response: result.response
      };
    } catch (error) {
      // Handle errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Chat tool error: ${errorMessage}`);
    }
  }
}
