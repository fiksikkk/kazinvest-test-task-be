import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { json } from 'express';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const frontendOrigin = process.env.FRONTEND_ORIGIN;
  const port = Number(process.env.PORT ?? 3000);

  // Respect the original client IP when the app is behind nginx.
  app.set('trust proxy', 1);

  app.enableCors({
    origin: frontendOrigin,
  });

  app.use(json({ limit: '16kb' }));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(port);
}

void bootstrap();
