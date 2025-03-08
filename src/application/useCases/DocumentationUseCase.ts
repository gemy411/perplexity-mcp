import { IAIService } from '../../domain/services/IAIService.js';

/**
 * Use case for retrieving documentation
 */
export class DocumentationUseCase {
  constructor(
    private aiService: IAIService
  ) {}

  /**
   * Gets documentation for a technology, library, or API
   * @param query The technology, library, or API to get documentation for
   * @param context Additional context or specific aspects to focus on
   * @returns The documentation and usage examples
   */
  async getDocumentation(query: string, context?: string): Promise<string> {
    // Construct a prompt that instructs the AI to provide documentation
    let prompt = `Please provide documentation and usage examples for ${query}.`;
    
    if (context) {
      prompt += `\nFocus on the following aspects or context: ${context}`;
    }

    // Send the documentation request to the AI service
    const response = await this.aiService.generateResponse([
      { role: "user", content: prompt }
    ]);

    return response.content;
  }
}
