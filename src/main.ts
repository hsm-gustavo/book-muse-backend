import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EnvService } from './env/env.service';
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(EnvService);
  app.setGlobalPrefix('api/v1');

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));
  await app.listen(configService.get('PORT') ?? 3000);
}
bootstrap();
