import { Transform, plainToInstance } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return 3000;
    }

    return Number(value);
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT = 3000;

  @IsString()
  GROQ_API_KEY!: string;

  @IsString()
  GROQ_MODEL = 'llama-3.3-70b-versatile';

  @IsUrl({
    require_tld: false,
    require_protocol: true,
  })
  FRONTEND_ORIGIN!: string;

  @IsOptional()
  @IsString()
  SYSTEM_INSTRUCTION = 'Reply briefly, clearly, and in English.';
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Environment validation failed: ${errors.toString()}`);
  }

  return validatedConfig;
}

export type AppConfig = EnvironmentVariables;
