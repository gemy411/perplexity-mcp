/**
 * Represents a chat session with Perplexity AI
 */
export class Chat {
  constructor(
    public readonly id: string,
    public readonly createdAt: Date = new Date()
  ) {}
}
