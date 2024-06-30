import 'dotenv/config';

import { Logger, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

import { version } from '../package.json';

async function bootstrap() {
  const appPort = parseInt(process.env.SERVER_PORT || '3000');
  const app = await NestFactory.create(AppModule);

  app
    .setGlobalPrefix('api', { exclude: ['health-check'] })
    .enableVersioning({ type: VersioningType.URI });

  SwaggerModule.setup(
    '/docs',
    app,
    SwaggerModule.createDocument(
      app,
      new DocumentBuilder().setTitle('Parking').setVersion(version).build(),
    ),
  );

  const logger = new Logger('BOOTSTRAP');
  await app.listen(appPort);
  logger.log(`listening to *:${appPort}`);
}
bootstrap();
