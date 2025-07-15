import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EnvService } from './env/env.service';
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const configService = app.get(EnvService);
  app.setGlobalPrefix('api/v1');

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.use(helmet());

  const documentBuilderConfig = new DocumentBuilder()
    .setTitle('BookMuse API')
    .setDescription(
      'Discover, track, and share your reading journey. Join thousands of book lovers who use BookMuse to organize their literary',
    )
    .addBearerAuth()
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, documentBuilderConfig);
  SwaggerModule.setup('api/v1/docs', app, document);

  await app.listen(configService.get('PORT') ?? 3000);
}
bootstrap();
