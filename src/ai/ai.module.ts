import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.service';
import { AI_TEXT_GENERATOR } from './ai.tokens';
import { GroqAiProvider } from './providers/groq-ai.provider';

@Module({
  imports: [ConfigModule],
  providers: [
    AiService,
    GroqAiProvider,
    {
      provide: AI_TEXT_GENERATOR,
      useExisting: GroqAiProvider,
    },
  ],
  exports: [AiService],
})
export class AiModule {}
