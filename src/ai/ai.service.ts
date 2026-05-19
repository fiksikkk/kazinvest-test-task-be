import { Inject, Injectable } from '@nestjs/common';
import { AI_TEXT_GENERATOR } from './ai.tokens';
import type { AiTextGenerator } from './interfaces/ai-text-generator.interface';

@Injectable()
export class AiService {
  constructor(
    @Inject(AI_TEXT_GENERATOR) private readonly textGenerator: AiTextGenerator,
  ) {}

  async generateText(message: string): Promise<string> {
    return this.textGenerator.generateText(message);
  }
}
