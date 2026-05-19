import { Test } from '@nestjs/testing';
import { AiService } from './ai.service';
import { AI_TEXT_GENERATOR } from './ai.tokens';
import type { AiTextGenerator } from './interfaces/ai-text-generator.interface';

describe('AiService', () => {
  let service: AiService;
  const textGenerator: AiTextGenerator = {
    generateText: jest.fn(),
  };

  beforeEach(async () => {
    jest.mocked(textGenerator.generateText).mockReset();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: AI_TEXT_GENERATOR,
          useValue: textGenerator,
        },
      ],
    }).compile();

    service = moduleRef.get(AiService);
  });

  it('delegates text generation to configured provider', async () => {
    jest.mocked(textGenerator.generateText).mockResolvedValue('Short answer');

    await expect(service.generateText('Hello')).resolves.toBe('Short answer');
    expect(textGenerator.generateText).toHaveBeenCalledWith('Hello');
  });
});
