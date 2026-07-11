// ── Env var safety net ───────────────────────────────────────────────────────
// Prisma schema declares `directUrl = env("DIRECT_URL")`.
// On Vercel, DIRECT_URL is only needed for migrations (which run locally).
// If it is not set as a Vercel env var, fall back to DATABASE_URL so
// PrismaClient does not crash on cold start.
if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}
// ─────────────────────────────────────────────────────────────────────────────

import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express from 'express';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/http-exception.filter';

// ─────────────────────────────────────────────────────────────────────────────
// Vercel Serverless Handler for NestJS
//
// Vercel runs functions on demand — there is no long-lived process.
// We wrap NestJS on top of a plain Express instance and export a handler
// that Vercel calls for every incoming request.
//
// The `initialized` flag caches the bootstrapped app across warm invocations
// so we only pay the cold-start cost once per Lambda container lifecycle.
// ─────────────────────────────────────────────────────────────────────────────

const expressServer = express();
let initialized = false;


async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressServer),
    { logger: ['error', 'warn'] },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.enableCors();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('EN2H Booking Platform API')
    .setDescription(
      'REST API for the EN2H Booking Platform — built with NestJS, TypeScript & PostgreSQL.\n\n' +
        '**Auth flow**: register → login → copy `accessToken` → click Authorize (top right).',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste your access token here',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.init();
}

export default async function handler(
  req: express.Request,
  res: express.Response,
) {
  if (!initialized) {
    await bootstrap();
    initialized = true;
  }
  expressServer(req, res);
}
