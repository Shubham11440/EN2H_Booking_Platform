import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  // Fail fast if required secrets are missing
  const required = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.enableCors();

  // ── Swagger ──────────────────────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('EN2H Booking Platform API')
    .setDescription(
      'REST API for the EN2H Booking Platform — built with NestJS, TypeScript & PostgreSQL.\n\n' +
        '**Auth flow**: register → login → copy `accessToken` → click Authorize (top right).',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Paste your access token here' },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
  // ─────────────────────────────────────────────────────────────────────────

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 EN2H Booking Platform running on http://localhost:${port}`);
  console.log(`📚 Swagger docs:            http://localhost:${port}/api/docs`);
}

bootstrap();

