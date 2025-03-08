import { IChatRepository } from '../domain/repositories/IChatRepository.js';
import { IAIService } from '../domain/services/IAIService.js';
import { ChatUseCase } from './useCases/ChatUseCase.js';
import { SearchUseCase } from './useCases/SearchUseCase.js';
import { DocumentationUseCase } from './useCases/DocumentationUseCase.js';
import { ApiFinderUseCase } from './useCases/ApiFinderUseCase.js';
import { CodeAnalysisUseCase } from './useCases/CodeAnalysisUseCase.js';

/**
 * Factory for creating application layer components
 */
export class ApplicationFactory {
  private chatUseCase: ChatUseCase;
  private searchUseCase: SearchUseCase;
  private documentationUseCase: DocumentationUseCase;
  private apiFinderUseCase: ApiFinderUseCase;
  private codeAnalysisUseCase: CodeAnalysisUseCase;

  /**
   * Creates a new ApplicationFactory
   * @param chatRepository The chat repository
   * @param aiService The AI service
   */
  constructor(
    private chatRepository: IChatRepository,
    private aiService: IAIService
  ) {
    // Initialize use cases
    this.chatUseCase = new ChatUseCase(chatRepository, aiService);
    this.searchUseCase = new SearchUseCase(aiService);
    this.documentationUseCase = new DocumentationUseCase(aiService);
    this.apiFinderUseCase = new ApiFinderUseCase(aiService);
    this.codeAnalysisUseCase = new CodeAnalysisUseCase(aiService);
  }

  /**
   * Gets the chat use case
   * @returns The chat use case
   */
  getChatUseCase(): ChatUseCase {
    return this.chatUseCase;
  }

  /**
   * Gets the search use case
   * @returns The search use case
   */
  getSearchUseCase(): SearchUseCase {
    return this.searchUseCase;
  }

  /**
   * Gets the documentation use case
   * @returns The documentation use case
   */
  getDocumentationUseCase(): DocumentationUseCase {
    return this.documentationUseCase;
  }

  /**
   * Gets the API finder use case
   * @returns The API finder use case
   */
  getApiFinderUseCase(): ApiFinderUseCase {
    return this.apiFinderUseCase;
  }

  /**
   * Gets the code analysis use case
   * @returns The code analysis use case
   */
  getCodeAnalysisUseCase(): CodeAnalysisUseCase {
    return this.codeAnalysisUseCase;
  }
}
