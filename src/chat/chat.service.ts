import { Injectable } from '@nestjs/common';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ChatService {
  constructor(private readonly aiService: AiService) {}

  async generateAnswer(message: string): Promise<string> {
    return this.aiService.generateText(message);
  }
}
