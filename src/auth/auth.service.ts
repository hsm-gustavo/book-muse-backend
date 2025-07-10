import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { HashingService } from './hashing/hashing.service';
import { EnvService } from 'src/env/env.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashingService: HashingService,
    private readonly envService: EnvService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    let throwError = true;
    let isValid = false;

    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    // login do usuario, checando se o usuario existe, se existir eu checo se o hash é valido
    if (user) {
      isValid = await this.hashingService.compare(
        dto.password,
        user.passwordHash,
      );
    }
    // se for valido significa q nao tenho q jogar erro
    if (isValid) {
      throwError = false;
    }

    // erro generico para evitar revelar informaçoes
    if (throwError)
      throw new UnauthorizedException('Email or password invalid');

    // gera um jwt assinado com sub, email, aud, iss, exp
    const accessToken = await this.jwtService.signAsync(
      {
        sub: user?.id,
        email: user?.email,
      },
      {
        audience: this.envService.get('JWT_TOKEN_AUDIENCE'),
        issuer: this.envService.get('JWT_TOKEN_ISSUER'),
        secret: this.envService.get('JWT_SECRET'),
        expiresIn: this.envService.get('JWT_TTL'),
      },
    );

    return {
      accessToken,
    };
  }
}
