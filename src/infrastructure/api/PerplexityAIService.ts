import axios, { AxiosInstance } from 'axios';
import { IAIService, AIServiceResponse } from '../../domain/services/IAIService.js';

/**
 * Perplexity AI service implementation
 */
export class PerplexityAIService implements IAIService {
  private axiosInstance: AxiosInstance;
  private model: string;

  /**
   * Creates a new instance of the Perplexity AI service
   * @param apiKey The Perplexity API key
   * @param model The model to use, defaults to "sonar-reasoning-pro"
   */
  constructor(apiKey: string, model: string = "sonar-reasoning-pro") {
    this.axiosInstance = axios.create({
      baseURL: "https://api.perplexity.ai",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });
    this.model = model;
  }

  /**
   * Generates a response from the Perplexity AI service
   * @param messages Array of messages with role and content
   * @returns The AI service response
   */
  async generateResponse(messages: Array<{role: string, content: string}>): Promise<AIServiceResponse> {
    try {
      const response = await this.axiosInstance.post('/chat/completions', {
        model: this.model,
        messages: messages,
      });

      const content = response.data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error("No content in response from Perplexity API");
      }

      return { content };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Perplexity API error: ${error.response?.data?.error?.message || error.message}`
        );
      }
      throw error;
    }
  }
}
