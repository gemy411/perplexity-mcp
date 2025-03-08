import { IAIService } from '../../domain/services/IAIService.js';

/**
 * Use case for search operations
 */
export class SearchUseCase {
  constructor(
    private aiService: IAIService
  ) {}

  /**
   * Performs a search query
   * @param query The search query
   * @param detailLevel Optional detail level (brief, normal, detailed)
   * @returns The search results
   */
  async search(query: string, detailLevel?: 'brief' | 'normal' | 'detailed'): Promise<string> {
    // Construct a prompt that instructs the AI to perform a search
    let prompt = `Please perform a comprehensive search on the following query: ${query}`;
    
    if (detailLevel) {
      prompt += `\nPlease provide ${detailLevel} level of detail in your response.`;
    }

    // Send the search query to the AI service
    const response = await this.aiService.generateResponse([
      { role: "user", content: prompt }
    ]);

    return response.content;
  }
}
