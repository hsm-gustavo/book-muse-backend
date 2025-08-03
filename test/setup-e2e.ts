import { CacheModule } from '@nestjs/cache-manager';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { envSchema } from 'src/env/env';
import { EnvService } from 'src/env/env.service';
import { PrismaService } from 'src/prisma/prisma.service';
import * as cacheable from 'cacheable';

export async function bootstrapE2E(): Promise<{
  app: INestApplication;
  prisma: PrismaService;
}> {
  const builder = Test.createTestingModule({
    imports: [AppModule],
  });

  builder.overrideModule(ConfigModule).useModule(
    ConfigModule.forRoot({
      envFilePath: '.env.test.local',
      isGlobal: true,
      validate: (env) => envSchema.parse(env),
    }),
  );

  builder.overrideProvider(EnvService).useValue({
    get: (k: string) => (k === 'REDIS_URL' ? '' : process.env[k] || ''),
  });

  builder.overrideModule(CacheModule).useModule(
    CacheModule.register({
      store: new cacheable.CacheableMemory({ lruSize: 1000 }),
      ttl: 60 * 60 * 1000,
    }),
  );

  const moduleRef = await builder.compile();
  const app = moduleRef.createNestApplication();
  await app.init();

  const prisma = moduleRef.get(PrismaService);
  await prisma.$connect();

  return { app, prisma };
}
