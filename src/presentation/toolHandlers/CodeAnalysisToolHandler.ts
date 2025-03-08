import { CodeAnalysisUseCase } from '../../application/useCases/CodeAnalysisUseCase.js';

/**
 * Handler for the check_deprecated_code tool
 */
export class CodeAnalysisToolHandler {
  constructor(private codeAnalysisUseCase: CodeAnalysisUseCase) {}

  /**
   * Handles a code analysis request
   * @param args The request arguments
   * @returns The code analysis results
   */
  async handle(args: { 
    code: string; 
    technology: string 
  }): Promise<{ result: string }> {
    try {
      const { code, technology } = args;
      
      // Check for deprecated code
      const result = await this.codeAnalysisUseCase.checkDeprecatedCode(code, technology);
      
      return {
        result
      };
    } catch (error) {
      // Handle errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Code analysis tool error: ${errorMessage}`);
    }
  }
}
