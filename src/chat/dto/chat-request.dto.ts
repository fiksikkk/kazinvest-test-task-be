import { Transform } from 'class-transformer';
import { IsString, Length } from 'class-validator';

export class ChatRequestDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(1, 4000)
  message!: string;
}
