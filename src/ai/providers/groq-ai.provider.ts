import {
  BadGatewayException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../config/env.validation';
import type { AiTextGenerator } from '../interfaces/ai-text-generator.interface';

interface GroqChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
}

@Injectable()
export class GroqAiProvider implements AiTextGenerator {
  private readonly logger = new Logger(GroqAiProvider.name);
  private readonly model: string;
  private readonly systemInstruction: string;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService<AppConfig, true>) {
    this.model = this.configService.get('GROQ_MODEL', { infer: true });
    this.systemInstruction = this.configService.get('SYSTEM_INSTRUCTION', {
      infer: true,
    });
    this.apiKey = this.configService.get('GROQ_API_KEY', { infer: true });
  }

  async generateText(message: string): Promise<string> {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: this.systemInstruction,
            },
            {
              role: 'user',
              content: message,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw {
          status: response.status,
          body: await response.text(),
        };
      }

      const data = (await response.json()) as GroqChatCompletionResponse;
      const answer = data.choices?.[0]?.message?.content?.trim();

      if (!answer) {
        this.logger.error('Groq returned an empty response');
        throw new BadGatewayException('The model returned an empty response. Please try again.');
      }

      return answer;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error('Groq request failed', error instanceof Error ? error.stack : undefined);
      throw this.mapGroqError(error);
    }
  }

  private mapGroqError(error: unknown): HttpException {
    const status = this.extractStatusCode(error);

    if (status === HttpStatus.TOO_MANY_REQUESTS) {
      return new HttpException(
        'The service is temporarily overloaded. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (status === HttpStatus.SERVICE_UNAVAILABLE || status === HttpStatus.GATEWAY_TIMEOUT) {
      return new ServiceUnavailableException(
        'The external AI service is temporarily unavailable. Please try again later.',
      );
    }

    if (status !== undefined) {
      return new BadGatewayException('Failed to get a response from the AI service.');
    }

    return new ServiceUnavailableException(
      'Unable to reach the AI service. Please try again later.',
    );
  }

  private extractStatusCode(error: unknown): number | undefined {
    if (typeof error !== 'object' || error === null) {
      return undefined;
    }

    const status = Reflect.get(error, 'status');
    if (typeof status === 'number') {
      return status;
    }

    const code = Reflect.get(error, 'code');
    if (typeof code === 'number') {
      return code;
    }

    const cause = Reflect.get(error, 'cause');
    if (typeof cause === 'object' && cause !== null) {
      const causeStatus = Reflect.get(cause, 'status');
      if (typeof causeStatus === 'number') {
        return causeStatus;
      }
    }

    return undefined;
  }
}
