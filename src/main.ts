import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from absolute paths
dotenv.config({ path: path.join(__dirname, '../.env.local') });
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure CORS
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://vikasbhattclasses.com',
  ];

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization, Cookie',
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Cookies support
  app.use(cookieParser());

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Vikas Bhatt Classes API')
    .setDescription('The Vikas Bhatt Classes Backend API Documentation')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT_AUTH',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 8080;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
  console.log(`Swagger Docs available at: http://localhost:${port}/api/docs`);
}
bootstrap();
