import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { HashingService } from './hashing/hashing.service';
import { EnvService } from 'src/env/env.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashingService: HashingService,
    private readonly envService: EnvService,
  ) {}

  async login(dto: LoginDto) {
    let throwError = true;
    let isValid = false;

    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (user) {
      isValid = await this.hashingService.compare(
        dto.password,
        user.passwordHash,
      );
    }

    if (isValid) {
      throwError = false;
    }

    if (throwError)
      throw new UnauthorizedException('Email or password invalid');

    return dto;
  }
}
