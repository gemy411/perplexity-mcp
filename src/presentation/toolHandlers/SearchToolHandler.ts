import { SearchUseCase } from '../../application/useCases/SearchUseCase.js';

/**
 * Handler for the search tool
 */
export class SearchToolHandler {
  constructor(private searchUseCase: SearchUseCase) {}

  /**
   * Handles a search request
   * @param args The request arguments
   * @returns The search results
   */
  async handle(args: { 
    query: string; 
    detail_level?: 'brief' | 'normal' | 'detailed' 
  }): Promise<{ result: string }> {
    try {
      const { query, detail_level } = args;
      
      // Perform the search
      const result = await this.searchUseCase.search(query, detail_level);
      
      return {
        result
      };
    } catch (error) {
      // Handle errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Search tool error: ${errorMessage}`);
    }
  }
}
