import { IAIService } from '../../domain/services/IAIService.js';

/**
 * Use case for finding and evaluating APIs
 */
export class ApiFinderUseCase {
  constructor(
    private aiService: IAIService
  ) {}

  /**
   * Finds and evaluates APIs that could be integrated into a project
   * @param requirement The functionality or requirement to fulfill
   * @param context Additional context about the project or specific needs
   * @returns Information about suitable APIs
   */
  async findApis(requirement: string, context?: string): Promise<string> {
    // Construct a prompt that instructs the AI to find and evaluate APIs
    let prompt = `Please find and evaluate APIs that could be integrated into a project to fulfill the following requirement: ${requirement}`;
    
    if (context) {
      prompt += `\nAdditional context about the project: ${context}`;
    }

    prompt += `\nFor each API, please provide:
1. Name and brief description
2. Main features relevant to the requirement
3. Pricing model (free tier, paid, etc.)
4. Ease of integration
5. Documentation quality
6. Community support and popularity
7. Pros and cons`;

    // Send the API finder request to the AI service
    const response = await this.aiService.generateResponse([
      { role: "user", content: prompt }
    ]);

    return response.content;
  }
}
