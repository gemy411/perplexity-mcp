/**
 * Represents a message in a chat session
 */
export class Message {
  constructor(
    public readonly id: number | null,
    public readonly chatId: string,
    public readonly role: "user" | "assistant",
    public readonly content: string,
    public readonly createdAt: Date = new Date()
  ) {}
}
