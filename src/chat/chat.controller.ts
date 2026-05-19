import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ChatService } from './chat.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatResponseDto } from './dto/chat-response.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @Throttle({ default: { limit: 15, ttl: 60_000 } })
  async chat(@Body() body: ChatRequestDto): Promise<ChatResponseDto> {
    const answer = await this.chatService.generateAnswer(body.message);

    return { answer };
  }
}
