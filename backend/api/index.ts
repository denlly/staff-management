import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import serverless from 'serverless-http';
import { AppModule } from '../src/app.module';

const expressApp = express();
let cachedHandler: ReturnType<typeof serverless>;

async function bootstrap() {
  if (cachedHandler) {
    return cachedHandler;
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

  cachedHandler = serverless(expressApp);
  return cachedHandler;
}

export default async function handler(req: express.Request, res: express.Response) {
  const serverlessHandler = await bootstrap();
  return serverlessHandler(req, res);
}
