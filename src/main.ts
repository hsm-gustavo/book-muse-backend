import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EnvService } from './env/env.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(EnvService);
  app.setGlobalPrefix('api/v1');
  await app.listen(configService.get('PORT') ?? 3000);
}
bootstrap();
