export interface AiTextGenerator {
  generateText(message: string): Promise<string>;
}
