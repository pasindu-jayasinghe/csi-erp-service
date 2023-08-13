import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import "reflect-metadata"
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'], // 'log', 'error', 'warn', 'debug', and 'verbose'.
   } );



  const options = new DocumentBuilder()
    .setTitle('ERP')
    .setDescription('leave and project management system')
    .setVersion('1.0')
    .addTag('ERP')
    .addCookieAuth('optional-session-id')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  app.enableCors();
  await app.listen(7070);
}
bootstrap();
