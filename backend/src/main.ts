// // src/main.ts

// import { NestFactory } from '@nestjs/core';
// import { ValidationPipe } from '@nestjs/common';
// import { AppModule } from './app.module';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });

//   app.enableCors({ origin: process.env.CLIENT_URL || '*' });

//   app.useGlobalPipes(
//     new ValidationPipe({
//       transform: true,  // auto-cast page/limit to number
//       whitelist: true,
//       forbidNonWhitelisted: false,
//     }),
//   );

//   await app.listen(process.env.PORT || 3000);
//   console.log(`🚀 http://localhost:${process.env.PORT || 3000}`);
// }

// bootstrap();



// src/main.ts

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  app.enableCors({ origin: process.env.CLIENT_URL || '*' });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,   // auto-cast page/limit to number, highlight to boolean
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  await app.listen(process.env.PORT || 3000);
  console.log(`🚀 http://localhost:${process.env.PORT || 3000}`);
}

bootstrap();