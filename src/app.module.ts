import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BooksModule } from './books/books.module';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { Keyv } from 'keyv';
import { CacheableMemory } from 'cacheable';
import { PrismaService } from './prisma/prisma.service';
import { envSchema } from './env/env';
import { EnvModule } from './env/env.module';
import { EnvService } from './env/env.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { StorageModule } from './storage/storage.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ReadingStatusModule } from './reading-status/reading-status.module';
import { PlaceholderModule } from './placeholder/placeholder.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    BooksModule,
    EnvModule,
    CacheModule.registerAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (envService: EnvService) => ({
        stores: [
          createKeyv(envService.get('REDIS_URL'), {
            namespace: 'book-review-platform',
          }),
          new Keyv({
            store: new CacheableMemory({ lruSize: 1000 }),
            namespace: 'book-review-platform',
          }),
        ],
        ttl: 60 * 60 * 1000,
      }),
      isGlobal: true,
    }),
    UsersModule,
    AuthModule,
    StorageModule,
    ReviewsModule,
    ReadingStatusModule,
    PlaceholderModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
