import { Test } from '@nestjs/testing';
import { AiService } from '../ai/ai.service';
import { ChatService } from './chat.service';

describe('ChatService', () => {
  let service: ChatService;
  const aiService = {
    generateText: jest.fn(),
  };

  beforeEach(async () => {
    aiService.generateText.mockReset();

    const moduleRef = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: AiService,
          useValue: aiService,
        },
      ],
    }).compile();

    service = moduleRef.get(ChatService);
  });

  it('delegates generation to AiService', async () => {
    aiService.generateText.mockResolvedValue('Short answer');

    await expect(service.generateAnswer('Hello')).resolves.toBe('Short answer');
    expect(aiService.generateText).toHaveBeenCalledWith('Hello');
  });
});
