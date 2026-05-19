import { BadGatewayException, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import type { AppConfig } from '../../config/env.validation';
import { GroqAiProvider } from './groq-ai.provider';

describe('GroqAiProvider', () => {
  let service: GroqAiProvider;
  const fetchMock = jest.fn();
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(async () => {
    fetchMock.mockReset();
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    global.fetch = fetchMock as typeof fetch;

    const moduleRef = await Test.createTestingModule({
      providers: [
        GroqAiProvider,
        {
          provide: ConfigService,
          useValue: {
            get: (key: keyof AppConfig) => {
              const config: Record<keyof AppConfig, string | number> = {
                PORT: 3000,
                GROQ_API_KEY: 'test-key',
                GROQ_MODEL: 'llama-3.3-70b-versatile',
                FRONTEND_ORIGIN: 'http://localhost:5173',
                SYSTEM_INSTRUCTION: 'Test instruction',
              };

              return config[key];
            },
          },
        },
      ],
    }).compile();

    service = moduleRef.get(GroqAiProvider);
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('returns Groq text on success', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Short answer' } }],
      }),
    });

    await expect(service.generateText('Hello')).resolves.toBe('Short answer');
  });

  it('throws 502 when Groq returns empty text', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '   ' } }],
      }),
    });

    await expect(service.generateText('Hello')).rejects.toBeInstanceOf(BadGatewayException);
  });

  it('maps 429 Groq errors to HttpException 429', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 429,
      text: async () => 'rate limited',
    });

    await expect(service.generateText('Hello')).rejects.toMatchObject({ status: 429 });
  });

  it('maps network errors to 503', async () => {
    fetchMock.mockRejectedValue(new Error('socket hang up'));

    await expect(service.generateText('Hello')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
