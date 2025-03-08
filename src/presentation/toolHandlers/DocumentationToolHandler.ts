import { DocumentationUseCase } from '../../application/useCases/DocumentationUseCase.js';

/**
 * Handler for the get_documentation tool
 */
export class DocumentationToolHandler {
  constructor(private documentationUseCase: DocumentationUseCase) {}

  /**
   * Handles a documentation request
   * @param args The request arguments
   * @returns The documentation results
   */
  async handle(args: { 
    query: string; 
    context?: string 
  }): Promise<{ result: string }> {
    try {
      const { query, context } = args;
      
      // Get the documentation
      const result = await this.documentationUseCase.getDocumentation(query, context);
      
      return {
        result
      };
    } catch (error) {
      // Handle errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Documentation tool error: ${errorMessage}`);
    }
  }
}
