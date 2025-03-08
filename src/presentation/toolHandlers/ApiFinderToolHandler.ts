import { ApiFinderUseCase } from '../../application/useCases/ApiFinderUseCase.js';

/**
 * Handler for the find_apis tool
 */
export class ApiFinderToolHandler {
  constructor(private apiFinderUseCase: ApiFinderUseCase) {}

  /**
   * Handles an API finder request
   * @param args The request arguments
   * @returns The API finder results
   */
  async handle(args: { 
    requirement: string; 
    context?: string 
  }): Promise<{ result: string }> {
    try {
      const { requirement, context } = args;
      
      // Find APIs
      const result = await this.apiFinderUseCase.findApis(requirement, context);
      
      return {
        result
      };
    } catch (error) {
      // Handle errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`API finder tool error: ${errorMessage}`);
    }
  }
}
