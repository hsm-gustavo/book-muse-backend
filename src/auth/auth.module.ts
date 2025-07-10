import { Global, Module } from '@nestjs/common';
import { HashingService } from './hashing/hashing.service';
import { BcryptService } from './hashing/bcrypt.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { EnvModule } from 'src/env/env.module';

@Global() // não precisa ser importado em outros módulos
@Module({
  imports: [EnvModule],
  providers: [
    {
      provide: HashingService, // registra o serviço de hashing como um provider global
      useClass: BcryptService, // usa a implementação BcryptService
    },
    AuthService,
    PrismaService,
  ],
  exports: [HashingService],
  controllers: [AuthController],
})
export class AuthModule {}
