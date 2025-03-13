import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { AppModule } from './app.module';

dotenv.config({ path: join(__dirname, '../.env') });

async function bootstrap() {
  console.log(`Bollette Server v2.1`);
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('BOLLETTE API')
    .setDescription(
      'Api for my fake betting platform built in Nest.js, Redis and MySql, \n To authenticate, please register on the register route, then copy the x-auth-token on the response headers and copy it in the approriate field',
    )
    .setVersion('2.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const customOptions: SwaggerCustomOptions = {
    customSiteTitle: 'Bollette API',
    swaggerOptions: {
      persistAuthorization: true,
    },
  };
  SwaggerModule.setup('api/swagger', app, document, customOptions);

  await app.listen(process.env.PORT);
  console.log(`Nest is running on port ${process.env.PORT}`);
}
bootstrap();
