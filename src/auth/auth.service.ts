import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { HashingService } from './hashing/hashing.service';
import { EnvService } from 'src/env/env.service';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { User } from 'generated/prisma';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashingService: HashingService,
    private readonly envService: EnvService,
    private readonly jwtService: JwtService,
  ) {}

  private async generateToken<T>(
    sub: string,
    expiresIn: string,
    payload: T,
  ): Promise<string> {
    return await this.jwtService.signAsync(
      {
        sub,
        ...payload,
      },
      {
        audience: this.envService.get('JWT_TOKEN_AUDIENCE'),
        issuer: this.envService.get('JWT_TOKEN_ISSUER'),
        secret: this.envService.get('JWT_SECRET'),
        expiresIn,
      },
    );
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const token = randomBytes(64).toString('hex');

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });

    return token;
  }

  async refresh(refreshTokenDto: RefreshTokenDto): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshTokenDto.refreshToken },
      include: { user: true },
    });

    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // revogando token
    await this.prisma.refreshToken.update({
      where: { token: refreshTokenDto.refreshToken },
      data: { revoked: true },
    });

    const accessToken = await this.generateToken<Partial<User>>(
      stored.user.id,
      this.envService.get('JWT_TTL'),
      {
        email: stored.user.email,
      },
    );

    const newRefreshToken = await this.generateRefreshToken(stored.userId);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async login(dto: LoginDto) {
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

    if (!user || !isValid) {
      throw new UnauthorizedException('Email or password invalid');
    }

    const refreshToken = await this.generateRefreshToken(user.id);

    // gera um jwt assinado com sub, email, aud, iss, exp
    const accessToken = await this.generateToken<Partial<User>>(
      user.id,
      this.envService.get('JWT_TTL'),
      {
        email: user.email,
      },
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}
