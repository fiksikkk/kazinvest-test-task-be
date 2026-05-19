import { BadRequestException, ServiceUnavailableException, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ChatController } from '../src/chat/chat.controller';
import { ChatRequestDto } from '../src/chat/dto/chat-request.dto';
import { ChatService } from '../src/chat/chat.service';
import { ChatModule } from '../src/chat/chat.module';

describe('ChatController (integration)', () => {
  let controller: ChatController;
  let validationPipe: ValidationPipe;
  const chatService = {
    generateAnswer: jest.fn(),
  };

  beforeEach(async () => {
    chatService.generateAnswer.mockReset();

    const moduleRef = await Test.createTestingModule({
      imports: [ChatModule],
    })
      .overrideProvider(ChatService)
      .useValue(chatService)
      .compile();

    controller = moduleRef.get(ChatController);
    validationPipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });
  });

  async function validateBody(body: Record<string, unknown>): Promise<ChatRequestDto> {
    return (await validationPipe.transform(body, {
      type: 'body',
      metatype: ChatRequestDto,
    })) as ChatRequestDto;
  }

  it('POST /chat returns answer', async () => {
    chatService.generateAnswer.mockResolvedValue('Model response');

    const dto = await validateBody({ message: 'Tell me about NestJS' });

    await expect(controller.chat(dto)).resolves.toEqual({ answer: 'Model response' });
  });

  it('POST /chat rejects empty message', async () => {
    await expect(validateBody({ message: '   ' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('POST /chat rejects too long message', async () => {
    await expect(validateBody({ message: 'a'.repeat(4001) })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('POST /chat maps service errors', async () => {
    chatService.generateAnswer.mockRejectedValue(
      new ServiceUnavailableException(
        'The external AI service is temporarily unavailable. Please try again later.',
      ),
    );

    const dto = await validateBody({ message: 'Hello' });

    await expect(controller.chat(dto)).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
