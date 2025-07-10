import { Global, Module } from '@nestjs/common';
import { HashingService } from './hashing/hashing.service';
import { BcryptService } from './hashing/bcrypt.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { EnvModule } from 'src/env/env.module';
import { JwtModule } from '@nestjs/jwt';
import { EnvService } from 'src/env/env.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Global() // não precisa ser importado em outros módulos
@Module({
  imports: [
    EnvModule,
    JwtModule.registerAsync({
      // async pois preciso injetar o EnvService
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (envService: EnvService) => ({
        secret: envService.get('JWT_SECRET'),
      }),
    }),
  ],
  providers: [
    {
      provide: HashingService, // registra o serviço de hashing como um provider global
      useClass: BcryptService, // usa a implementação BcryptService
    },
    AuthService,
    PrismaService,
    JwtStrategy,
  ],
  exports: [HashingService],
  controllers: [AuthController],
})
export class AuthModule {}
