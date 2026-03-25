import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { buildCorsOptions } from './modules/config/cors.config';

import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // ENV
  const port = configService.get<number>('port') ?? 3001;
  const nodeEnv = configService.get<string>('environment') ?? 'development';
  const frontendUrl =
    configService.get<string>('frontend.url') ?? 'http://localhost:3000';

  // 🛡️ Helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // 🌍 CORS
  const allowedOrigins: string[] = [
    'http://localhost:3000',
    'http://localhost:3002',
    'http://localhost:5173',
    'https://edtech-blush-one.vercel.app',
    frontendUrl,
  ].filter(Boolean);

  app.enableCors(buildCorsOptions(allowedOrigins));

  // ⚙️ Global prefix
  app.setGlobalPrefix('');

  // 🧠 Preflight (OPTIONS)
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // ✅ Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 📘 Swagger
  const configBuilder = new DocumentBuilder()
    .setTitle('Testimonial CMS API')
    .setDescription('API para gestión de testimonios')
    .setVersion('1.0')
    .addBearerAuth();

  if (nodeEnv === 'development') {
    configBuilder.addServer(`http://localhost:${port}`, 'Local');
  }

  configBuilder.addServer(
    'https://edtech-equipo-02.onrender.com',
    'Producción',
  );

  const document = SwaggerModule.createDocument(
    app,
    configBuilder
      .addTag('auth')
      .addTag('users')
      .addTag('testimonials')
      .addTag('categories')
      .addTag('tags')
      .addTag('media')
      .addTag('moderation')
      .addTag('analytics')
      .addTag('embed')
      .build(),
  );

  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);

  const baseUrl =
    nodeEnv === 'production'
      ? 'https://edtech-equipo-02.onrender.com'
      : `http://localhost:${port}`;

  console.log(`🚀 Running on: ${baseUrl}`);
  console.log(`📚 Docs: ${baseUrl}/api/docs`);
}

void bootstrap();
