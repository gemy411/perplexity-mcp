/**
 * Response from an AI service
 */
export interface AIServiceResponse {
  content: string;
}

/**
 * Interface for AI service operations
 */
export interface IAIService {
  /**
   * Generates a response from the AI service
   * @param messages Array of messages with role and content
   * @returns The AI service response
   */
  generateResponse(messages: Array<{role: string, content: string}>): Promise<AIServiceResponse>;
}
