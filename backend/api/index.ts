import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from '../src/app.module';

const expressApp = express();
let isBootstrapped = false;

async function bootstrap() {
  if (isBootstrapped) {
    return;
  }

  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN ?? '*',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.setGlobalPrefix('api');
  await app.init();
  isBootstrapped = true;
}

export default async function handler(req: express.Request, res: express.Response) {
  await bootstrap();
  return expressApp(req, res);
}
