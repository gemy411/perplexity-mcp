import { IAIService } from '../../domain/services/IAIService.js';

/**
 * Use case for analyzing code
 */
export class CodeAnalysisUseCase {
  constructor(
    private aiService: IAIService
  ) {}

  /**
   * Checks if code or dependencies might be using deprecated features
   * @param code The code snippet or dependency to check
   * @param technology The technology or framework context
   * @returns Analysis of deprecated features and recommendations
   */
  async checkDeprecatedCode(code: string, technology: string): Promise<string> {
    // Construct a prompt that instructs the AI to analyze code for deprecated features
    const prompt = `Please analyze the following ${technology} code or dependency for deprecated features:

\`\`\`
${code}
\`\`\`

Please provide:
1. Identification of any deprecated features, methods, or dependencies
2. When each identified item was deprecated (if known)
3. What the current recommended alternative is
4. Example of how to update the code to use the recommended alternative
5. Any potential breaking changes to be aware of when updating`;

    // Send the code analysis request to the AI service
    const response = await this.aiService.generateResponse([
      { role: "user", content: prompt }
    ]);

    return response.content;
  }
}
